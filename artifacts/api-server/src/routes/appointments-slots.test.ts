import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
}));

vi.mock("@workspace/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@workspace/db")>();
  return {
    ...actual,
    db: {
      ...actual.db,
      select: state.select,
    },
  };
});

const { default: appointmentsSlotsRouter } = await import("./appointments-slots");

const app = express();
app.use("/api", appointmentsSlotsRouter);

describe("GET /api/appointments/slots", () => {
  beforeEach(() => {
    state.select.mockReset();
    state.from.mockReset();
    state.where.mockReset();

    state.select.mockReturnValue({ from: state.from });
    state.from.mockReturnValue({ where: state.where });
  });

  it("returns only the date/time projection for non-cancelled appointments", async () => {
    state.where.mockResolvedValue([
      {
        appointmentDate: "2026-09-20",
        appointmentTime: "9:00 AM",
        status: "confirmed",
        patientName: "Private patient",
      },
    ]);

    const response = await request(app)
      .get("/api/appointments/slots")
      .query({ doctorId: "42", clinicId: "7" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { appointmentDate: "2026-09-20", appointmentTime: "9:00 AM" },
    ]);
    expect(Object.keys(state.select.mock.calls[0]?.[0] ?? {})).toEqual([
      "appointmentDate",
      "appointmentTime",
    ]);
  });

  it.each([
    ["missing doctorId", {}],
    ["zero doctorId", { doctorId: "0" }],
    ["fractional doctorId", { doctorId: "1.5" }],
    ["negative clinicId", { doctorId: "42", clinicId: "-1" }],
  ])("rejects %s", async (_label, query) => {
    const response = await request(app)
      .get("/api/appointments/slots")
      .query(query);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid appointment filters" });
    expect(state.select).not.toHaveBeenCalled();
  });
});