import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sql, type SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import {
  appointmentsTable,
  doctorsTable,
  medicalCentersTable,
} from "@workspace/db/schema";

type Account = {
  id: number;
  role: string;
  isActive: boolean;
  assistantDoctorId?: number | null;
  assistantClinicId?: number | null;
};

type SubqueryCapture = {
  selection: Record<string, unknown>;
  source: unknown;
  joins: Array<{ table: unknown; on: unknown }>;
  where: unknown;
};

/*
 * Keep the real schema objects and Drizzle expressions.  Only the database
 * session is mocked because this suite intentionally has no provisioned DB.
 */
const state = vi.hoisted(() => ({
  caller: null as Account | null,
  rows: [] as Array<Record<string, unknown>>,
  callerWhere: undefined as unknown,
  mainWhere: undefined as unknown,
  mainJoins: [] as Array<{ table: unknown; on: unknown }>,
  subqueries: [] as SubqueryCapture[],
  dbSelect: vi.fn(),
}));

vi.mock("@workspace/db", async () => {
  const schema = await import("@workspace/db/schema");
  return {
    ...schema,
    db: { select: state.dbSelect },
  };
});

vi.mock("../lib/email", () => ({
  sendAppointmentCancelledEmail: vi.fn(),
  sendAppointmentConfirmedEmail: vi.fn(),
}));

vi.mock("../lib/paymob.service.js", () => ({
  dispatchPaymobRefund: vi.fn(),
}));

vi.mock("../lib/wallet.service.js", () => ({
  releaseBookingEscrowInTx: vi.fn(),
}));

const { default: appointmentsRouter } = await import("./appointments");

const app = express();
app.use(express.json());
app.use("/api", appointmentsRouter);

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const dialect = new PgDialect();

function tokenFor(sub: number, role: string): string {
  return jwt.sign({ sub, role }, JWT_SECRET);
}

function activeAccount(
  role: string,
  overrides: Partial<Account> = {},
): Account {
  return {
    id: 31,
    role,
    isActive: true,
    assistantDoctorId: null,
    assistantClinicId: null,
    ...overrides,
  };
}

function compiled(expression: unknown): { sql: string; params: unknown[] } {
  return dialect.sqlToQuery(expression as SQL);
}

function makeCallerQuery() {
  const query = {
    from(_source: unknown) {
      return query;
    },
    where(predicate: unknown) {
      state.callerWhere = predicate;
      return query;
    },
    limit(_count: number) {
      return Promise.resolve(state.caller ? [state.caller] : []);
    },
  };
  return query;
}

function makeSubquery(selection: Record<string, unknown>) {
  const capture: SubqueryCapture = {
    selection,
    source: undefined,
    joins: [],
    where: undefined,
  };
  state.subqueries.push(capture);

  const query = {
    from(source: unknown) {
      capture.source = source;
      return query;
    },
    innerJoin(table: unknown, on: unknown) {
      capture.joins.push({ table, on });
      return query;
    },
    where(predicate: unknown) {
      capture.where = predicate;
      return {
        getSQL() {
          const selectedId = capture.selection.id;
          const join = capture.joins[0];
          return join
            ? sql`select ${selectedId} from ${capture.source} inner join ${join.table} on ${join.on} where ${predicate}`
            : sql`select ${selectedId} from ${capture.source} where ${predicate}`;
        },
      };
    },
  };
  return query;
}

function makeAppointmentsQuery() {
  const query = {
    from(_source: unknown) {
      return query;
    },
    leftJoin(table: unknown, on: unknown) {
      state.mainJoins.push({ table, on });
      return query;
    },
    where(predicate: unknown) {
      state.mainWhere = predicate;
      return query;
    },
    then(
      onFulfilled: (value: Array<Record<string, unknown>>) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve(state.rows).then(onFulfilled, onRejected);
    },
  };
  return query;
}

state.dbSelect.mockImplementation((selection?: unknown) => {
  if (selection === undefined) return makeCallerQuery();

  const fields = selection as Record<string, unknown>;
  if (Object.keys(fields).length === 1) return makeSubquery(fields);
  return makeAppointmentsQuery();
});

beforeEach(() => {
  state.caller = null;
  state.rows = [];
  state.callerWhere = undefined;
  state.mainWhere = undefined;
  state.mainJoins = [];
  state.subqueries = [];
  state.dbSelect.mockClear();
});

describe("GET /api/appointments authorization", () => {
  it.each([
    ["a missing token", undefined],
    ["an invalid token", "Bearer not-a-valid-token"],
    ["a non-Bearer authorization header", "Basic abc123"],
  ])("rejects requests with %s", async (_label, authorization) => {
    const pendingRequest = request(app).get("/api/appointments");
    const response = authorization
      ? await pendingRequest.set("Authorization", authorization)
      : await pendingRequest;

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
    expect(state.dbSelect).not.toHaveBeenCalled();
  });

  it.each([
    ["a non-numeric doctor id", { doctorId: "not-a-number" }],
    ["a non-positive clinic id", { clinicId: "0" }],
    ["a non-integer patient id", { patientUserId: "12.5" }],
  ])("rejects %s filters before querying the account", async (_label, query) => {
    const account = activeAccount("patient");
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .query(query)
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid appointment filters" });
    expect(state.dbSelect).not.toHaveBeenCalled();
  });

  it.each([
    ["an inactive persisted account", activeAccount("patient", { isActive: false }), "patient"],
    ["a token role that differs from the persisted role", activeAccount("patient"), "admin"],
    ["an account that is no longer present", null, "patient"],
  ])("rejects %s", async (_label, caller, tokenRole) => {
    state.caller = caller;
    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${tokenFor(31, tokenRole)}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Forbidden" });
    expect(state.dbSelect).toHaveBeenCalledOnce();
    expect(state.mainWhere).toBeUndefined();
  });

  it("always scopes a patient to its persisted account, including with no filters", async () => {
    const account = activeAccount("patient", { id: 42 });
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(state.mainWhere).toBeDefined();

    const predicate = compiled(state.mainWhere);
    expect(predicate.sql).toBe('"appointments"."patient_user_id" = $1');
    expect(predicate.params).toEqual([42]);
    expect(state.subqueries).toHaveLength(0);
  });

  it.each([
    ["a cross-user patient selector", { patientUserId: "999" }, ["patient_user_id", "patient_user_id"]],
    ["a phone selector for another patient", { patientPhone: "+201000000999" }, ["patient_user_id", "patient_phone"]],
  ])("keeps patient ownership ahead of %s", async (_label, query, expectedColumns) => {
    const account = activeAccount("patient", { id: 42 });
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .query(query)
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(200);
    const predicate = compiled(state.mainWhere);
    for (const column of expectedColumns) {
      expect(predicate.sql).toContain(`"appointments"."${column}"`);
    }
    expect(predicate.sql).toContain('"appointments"."patient_user_id" = $1');
    expect(predicate.params[0]).toBe(42);
    expect(state.callerWhere).toBeDefined();
  });

  it("uses a doctor ownership subquery before applying requested filters", async () => {
    const account = activeAccount("doctor", { id: 12 });
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .query({ doctorId: "999" })
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(200);
    expect(state.subqueries).toHaveLength(1);
    const [doctorSubquery] = state.subqueries;
    expect(doctorSubquery.source).toBe(doctorsTable);
    expect(doctorSubquery.joins).toHaveLength(0);
    expect(compiled(doctorSubquery.where)).toEqual({
      sql: '"doctors"."user_id" = $1',
      params: [12],
      typings: ["none"],
    });

    const predicate = compiled(state.mainWhere);
    expect(predicate.sql).toContain(
      '"appointments"."doctor_id" in (select "doctors"."id" from "doctors" where "doctors"."user_id" = $1)',
    );
    expect(predicate.sql).toContain('"appointments"."doctor_id" = $2');
    expect(predicate.params).toEqual([12, 999]);
  });

  it("uses the medical-center ownership join in the doctor subquery", async () => {
    const account = activeAccount("medical_center", { id: 77 });
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .query({ doctorId: "999" })
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(200);
    expect(state.subqueries).toHaveLength(1);
    const [centerSubquery] = state.subqueries;
    expect(centerSubquery.source).toBe(doctorsTable);
    expect(centerSubquery.joins).toHaveLength(1);
    expect(centerSubquery.joins[0].table).toBe(medicalCentersTable);
    expect(compiled(centerSubquery.joins[0].on)).toMatchObject({
      sql: '"doctors"."affiliated_center_id" = "medical_centers"."id"',
      params: [],
    });
    expect(compiled(centerSubquery.where)).toEqual({
      sql: '"medical_centers"."user_id" = $1',
      params: [77],
      typings: ["none"],
    });
  });

  it("scopes an active assistant to its assigned doctor and clinic", async () => {
    const account = activeAccount("assistant", {
      id: 22,
      assistantDoctorId: 31,
      assistantClinicId: 41,
    });
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(200);
    const predicate = compiled(state.mainWhere);
    expect(predicate.sql).toContain('"appointments"."doctor_id" = $1');
    expect(predicate.sql).toContain('"appointments"."clinic_id" = $2');
    expect(predicate.params).toEqual([31, 41]);
  });

  it("does not add a clinic restriction for an active assistant without a clinic assignment", async () => {
    const account = activeAccount("assistant", {
      id: 22,
      assistantDoctorId: 31,
      assistantClinicId: null,
    });
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(200);
    const predicate = compiled(state.mainWhere);
    expect(predicate.sql).toBe('"appointments"."doctor_id" = $1');
    expect(predicate.params).toEqual([31]);
    expect(predicate.sql).not.toContain("clinic_id");
  });

  it.each([
    ["a revoked assistant account", activeAccount("assistant", {
      isActive: false,
      assistantDoctorId: 31,
    })],
    ["an assistant with no doctor assignment", activeAccount("assistant", {
      assistantDoctorId: null,
      assistantClinicId: 41,
    })],
  ])("rejects %s before reading appointment rows", async (_label, account) => {
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Forbidden" });
    expect(state.dbSelect).toHaveBeenCalledOnce();
    expect(state.mainWhere).toBeUndefined();
  });

  it("allows an active admin to query appointments without an ownership predicate", async () => {
    const account = activeAccount("admin", { id: 1 });
    state.caller = account;

    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${tokenFor(account.id, account.role)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(state.dbSelect).toHaveBeenCalledTimes(2);
    expect(state.mainWhere).toBeUndefined();
    expect(state.subqueries).toHaveLength(0);
  });
});