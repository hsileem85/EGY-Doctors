import { Router, type IRouter } from "express";
import { eq, max } from "drizzle-orm";
import { db, doctorsTable, specialtiesTable, citiesTable, areasTable, usersTable } from "@workspace/db";
import { sendDoctorApprovedEmail } from "../lib/email.js";

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
  ApproveDoctorParams,
  RejectDoctorParams,
  UpdateDoctorOnboardingParams,
  UpdateDoctorOnboardingBody,
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

async function listDoctorsWithDetails() {
  const rows = await db
    .select({
      id: doctorsTable.id,
      userId: doctorsTable.userId,
      name: doctorsTable.nameEn,
      nameAr: doctorsTable.name,
      specialtyId: doctorsTable.specialtyId,
      specialtyName: specialtiesTable.name,
      cityId: doctorsTable.cityId,
      cityName: citiesTable.name,
      areaId: doctorsTable.areaId,
      areaName: areasTable.name,
      clinicAddress: doctorsTable.clinicAddress,
      bio: doctorsTable.bioEn,
      bioAr: doctorsTable.bio,
      image: doctorsTable.image,
      fee: doctorsTable.fee,
      experience: doctorsTable.experience,
      license: doctorsTable.license,
      syndicateNumber: usersTable.syndicateNumber,
      email: usersTable.email,
      phone: usersTable.phone,
      rating: doctorsTable.rating,
      reviews: doctorsTable.reviews,
      accountStatus: doctorsTable.accountStatus,
      onboardingStatus: doctorsTable.onboardingStatus,
      createdAt: doctorsTable.createdAt,
      updatedAt: doctorsTable.updatedAt,
    })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .leftJoin(citiesTable, eq(doctorsTable.cityId, citiesTable.id))
    .leftJoin(areasTable, eq(doctorsTable.areaId, areasTable.id))
    .leftJoin(usersTable, eq(doctorsTable.userId, usersTable.id));
  return rows;
}

router.get("/admin/doctors", async (req, res): Promise<void> => {
  const params = ListDoctorsQueryParams.safeParse(req.query);
  const status = params.success ? params.data.status : undefined;

  const rows = await listDoctorsWithDetails();
  const filtered = status != null
    ? rows.filter((r) => r.accountStatus === status)
    : rows;

  res.json(stringifyDates(filtered));
});

router.delete("/admin/doctors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [doctor] = await db.select({ userId: doctorsTable.userId }).from(doctorsTable).where(eq(doctorsTable.id, id));
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  await db.delete(doctorsTable).where(eq(doctorsTable.id, id));
  await db.delete(usersTable).where(eq(usersTable.id, doctor.userId));

  res.status(204).send();
});

router.get("/admin/doctors/pending", async (_req, res): Promise<void> => {
  const rows = await listDoctorsWithDetails();
  res.json(stringifyDates(rows.filter((r) => r.accountStatus === "pending")));
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

  const [user] = await db.select({ email: usersTable.email, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, doctor.userId))
    .limit(1);

  if (user?.email) {
    sendDoctorApprovedEmail(user.email, user.name).catch(() => {});
  }

  res.json(stringifyRow(doctor));
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

  res.json(stringifyRow(doctor));
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

  res.json(stringifyRow(doctor));
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

  let { displayOrder } = parsed.data;
  if (displayOrder == null) {
    const [result] = await db.select({ maxOrder: max(specialtiesTable.displayOrder) }).from(specialtiesTable);
    displayOrder = (result?.maxOrder ?? 0) + 1;
  }

  const [row] = await db.insert(specialtiesTable).values({ ...parsed.data, displayOrder }).returning();
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

  let { displayOrder } = parsed.data;
  if (displayOrder == null) {
    const [result] = await db.select({ maxOrder: max(citiesTable.displayOrder) }).from(citiesTable);
    displayOrder = (result?.maxOrder ?? 0) + 1;
  }

  const [row] = await db.insert(citiesTable).values({ ...parsed.data, displayOrder }).returning();
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

  let { displayOrder } = parsed.data;
  if (displayOrder == null) {
    const [result] = await db
      .select({ maxOrder: max(areasTable.displayOrder) })
      .from(areasTable)
      .where(eq(areasTable.cityId, parsed.data.cityId));
    displayOrder = (result?.maxOrder ?? 0) + 1;
  }

  const [row] = await db.insert(areasTable).values({ ...parsed.data, displayOrder }).returning();
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
