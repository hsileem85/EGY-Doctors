import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import {
  appointmentsTable,
  doctorsTable,
  usersTable,
} from "@workspace/db/schema";

type Caller = {
  id: number;
  role: string;
  isActive: boolean;
};

const state = vi.hoisted(() => ({
  caller: null as Caller | null,
  doctorRow: { id: 73 } as { id: number } | null,
  rows: [] as Array<Record<string, unknown>>,
  callerWhere: undefined as unknown,
  doctorWhere: undefined as unknown,
  patientsWhere: undefined as unknown,
  dbSelect: vi.fn(),
}));

vi.mock("@workspace/db", async () => {
  const schema = await import("@workspace/db/schema");
  return {
    ...schema,
    db: { select: state.dbSelect },
  };
});

vi.mock("../lib/wallet.service.js", () => ({
  releaseReservedCashbackInTx: vi.fn(),
}));

const { default: doctorsRouter } = await import("./doctors");

const app = express();
app.use(express.json());
app.use("/api", doctorsRouter);

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const dialect = new PgDialect();

function tokenFor(sub: number, role: string): string {
  return jwt.sign({ sub, role }, JWT_SECRET);
}

function compiled(expression: unknown): { sql: string; params: unknown[] } {
  return dialect.sqlToQuery(expression as SQL);
}

beforeEach(() => {
  state.caller = null;
  state.doctorRow = { id: 73 };
  state.rows = [];
  state.callerWhere = undefined;
  state.doctorWhere = undefined;
  state.patientsWhere = undefined;
  state.dbSelect.mockReset();
  state.dbSelect.mockImplementation(() => {
    let source: unknown;
    const query = {
      from(table: unknown) {
        source = table;
        return query;
      },
      where(predicate: unknown) {
        if (source === usersTable) state.callerWhere = predicate;
        if (source === doctorsTable) state.doctorWhere = predicate;
        if (source === appointmentsTable) state.patientsWhere = predicate;
        return query;
      },
      limit(_count: number) {
        if (source === usersTable) {
          return Promise.resolve(state.caller ? [state.caller] : []);
        }
        if (source === doctorsTable) {
          return Promise.resolve(state.doctorRow ? [state.doctorRow] : []);
        }
        return Promise.resolve([]);
      },
      orderBy(_order: unknown) {
        return Promise.resolve(state.rows);
      },
    };
    return query;
  });
});

describe("GET /api/doctors/patients authorization", () => {
  it.each([
    ["a missing token", undefined, { error: "Unauthorized" }],
    ["an invalid token", "Bearer not-a-valid-token", { error: "Invalid token" }],
  ])("rejects requests with %s before querying", async (_label, authorization, body) => {
    const pendingRequest = request(app).get("/api/doctors/patients");
    const response = authorization
      ? await pendingRequest.set("Authorization", authorization)
      : await pendingRequest;

    expect(response.status).toBe(401);
    expect(response.body).toEqual(body);
    expect(state.dbSelect).not.toHaveBeenCalled();
  });

  it.each([
    ["an inactive doctor account", { id: 31, role: "doctor", isActive: false }, "doctor"],
    ["a deleted account", null, "doctor"],
    ["a caller whose persisted role changed", { id: 31, role: "patient", isActive: true }, "doctor"],
    ["a token whose role changed", { id: 31, role: "doctor", isActive: true }, "admin"],
  ])("rejects %s before reading appointment PII", async (_label, caller, tokenRole) => {
    state.caller = caller;

    const response = await request(app)
      .get("/api/doctors/patients")
      .set("Authorization", `Bearer ${tokenFor(31, tokenRole)}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Forbidden" });
    expect(state.patientsWhere).toBeUndefined();
  });

  it("scopes a valid doctor to the owned doctor id", async () => {
    state.caller = { id: 31, role: "doctor", isActive: true };
    state.doctorRow = { id: 73 };
    state.rows = [{
      patientName: "Patient One",
      patientPhone: "+201000000001",
      patientUserId: 42,
      appointmentDate: "2026-01-02",
      status: "confirmed",
    }];

    const response = await request(app)
      .get("/api/doctors/patients")
      .set("Authorization", `Bearer ${tokenFor(31, "doctor")}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      patientName: "Patient One",
      patientPhone: "+201000000001",
      patientUserId: 42,
      lastVisit: "2026-01-02",
      totalVisits: 1,
      status: "confirmed",
    }]);
    expect(compiled(state.patientsWhere)).toEqual({
      sql: '"appointments"."doctor_id" = $1',
      params: [73],
      typings: ["none"],
    });
  });
});