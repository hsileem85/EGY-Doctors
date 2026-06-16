import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, doctorsTable, specialtiesTable, citiesTable, areasTable } from "@workspace/db";

function stringifyDates<T>(rows: T[]): T[] {
  return rows.map((row) => stringifyRow(row));
}

function stringifyRow<T>(row: T): T {
  const r = { ...row } as Record<string, unknown>;
  if (r.createdAt instanceof Date) r.createdAt = r.createdAt.toISOString();
  if (r.updatedAt instanceof Date) r.updatedAt = r.updatedAt.toISOString();
  return r as T;
}

import {
  ListDoctorsQueryParams,
  ListDoctorsResponse,
  ApproveDoctorParams,
  ApproveDoctorResponse,
  RejectDoctorParams,
  RejectDoctorResponse,
  UpdateDoctorOnboardingParams,
  UpdateDoctorOnboardingBody,
  UpdateDoctorOnboardingResponse,
  ListSpecialtiesResponse,
  CreateSpecialtyBody,
  UpdateSpecialtyParams,
  UpdateSpecialtyBody,
  UpdateSpecialtyResponse,
  DeleteSpecialtyParams,
  ListCitiesResponse,
  CreateCityBody,
  UpdateCityParams,
  UpdateCityBody,
  UpdateCityResponse,
  DeleteCityParams,
  ListAreasQueryParams,
  ListAreasResponse,
  CreateAreaBody,
  UpdateAreaParams,
  UpdateAreaBody,
  UpdateAreaResponse,
  DeleteAreaParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

/* ─── Doctors ─── */

router.get("/admin/doctors", async (req, res): Promise<void> => {
  const params = ListDoctorsQueryParams.safeParse(req.query);
  const status = params.success ? params.data.status : undefined;

  const query = db.select().from(doctorsTable);
  const doctors = status != null
    ? await query.where(eq(doctorsTable.accountStatus, status as "pending" | "approved" | "rejected"))
    : await query;

  res.json(ListDoctorsResponse.parse(stringifyDates(doctors)));
});

router.get("/admin/doctors/pending", async (_req, res): Promise<void> => {
  const doctors = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.accountStatus, "pending"));

  res.json(ListDoctorsResponse.parse(stringifyDates(doctors)));
});

router.patch("/admin/doctors/:id/approve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = ApproveDoctorParams.safeParse({ id: raw });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [doctor] = await db
    .update(doctorsTable)
    .set({ accountStatus: "approved" })
    .where(eq(doctorsTable.id, parsed.data.id))
    .returning();

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(ApproveDoctorResponse.parse(stringifyRow(doctor)));
});

router.patch("/admin/doctors/:id/reject", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = RejectDoctorParams.safeParse({ id: raw });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [doctor] = await db
    .update(doctorsTable)
    .set({ accountStatus: "rejected" })
    .where(eq(doctorsTable.id, parsed.data.id))
    .returning();

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(RejectDoctorResponse.parse(stringifyRow(doctor)));
});

router.patch("/admin/doctors/:id/onboarding", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateDoctorOnboardingParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateDoctorOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [doctor] = await db
    .update(doctorsTable)
    .set({ onboardingStatus: parsed.data.status })
    .where(eq(doctorsTable.id, params.data.id))
    .returning();

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(UpdateDoctorOnboardingResponse.parse(stringifyRow(doctor)));
});

/* ─── Specialties ─── */

router.get("/admin/specialties", async (_req, res): Promise<void> => {
  const rows = await db.select().from(specialtiesTable).orderBy(specialtiesTable.displayOrder);
  res.json(ListSpecialtiesResponse.parse(stringifyDates(rows)));
});

router.post("/admin/specialties", async (req, res): Promise<void> => {
  const parsed = CreateSpecialtyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(specialtiesTable).values(parsed.data).returning();
  res.status(201).json(UpdateSpecialtyResponse.parse(stringifyRow(row)));
});

router.put("/admin/specialties/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateSpecialtyParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateSpecialtyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(specialtiesTable)
    .set(parsed.data)
    .where(eq(specialtiesTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Specialty not found" });
    return;
  }

  res.json(UpdateSpecialtyResponse.parse(stringifyRow(row)));
});

router.delete("/admin/specialties/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSpecialtyParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(specialtiesTable)
    .where(eq(specialtiesTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Specialty not found" });
    return;
  }

  res.sendStatus(204);
});

/* ─── Cities ─── */

router.get("/admin/cities", async (_req, res): Promise<void> => {
  const rows = await db.select().from(citiesTable).orderBy(citiesTable.displayOrder);
  res.json(ListCitiesResponse.parse(stringifyDates(rows)));
});

router.post("/admin/cities", async (req, res): Promise<void> => {
  const parsed = CreateCityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(citiesTable).values(parsed.data).returning();
  res.status(201).json(UpdateCityResponse.parse(stringifyRow(row)));
});

router.put("/admin/cities/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCityParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateCityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(citiesTable)
    .set(parsed.data)
    .where(eq(citiesTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "City not found" });
    return;
  }

  res.json(UpdateCityResponse.parse(stringifyRow(row)));
});

router.delete("/admin/cities/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteCityParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(citiesTable)
    .where(eq(citiesTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "City not found" });
    return;
  }

  res.sendStatus(204);
});

/* ─── Areas ─── */

router.get("/admin/areas", async (req, res): Promise<void> => {
  const params = ListAreasQueryParams.safeParse(req.query);
  const cityId = params.success ? params.data.cityId : undefined;

  const query = db.select().from(areasTable);
  const rows = cityId != null
    ? await query.where(eq(areasTable.cityId, cityId))
    : await query;

  res.json(ListAreasResponse.parse(stringifyDates(rows)));
});

router.post("/admin/areas", async (req, res): Promise<void> => {
  const parsed = CreateAreaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(areasTable).values(parsed.data).returning();
  res.status(201).json(UpdateAreaResponse.parse(stringifyRow(row)));
});

router.put("/admin/areas/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateAreaParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateAreaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(areasTable)
    .set(parsed.data)
    .where(eq(areasTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Area not found" });
    return;
  }

  res.json(UpdateAreaResponse.parse(stringifyRow(row)));
});

router.delete("/admin/areas/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteAreaParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(areasTable)
    .where(eq(areasTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Area not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
