import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, max, inArray, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, doctorsTable, specialtiesTable, citiesTable, areasTable, usersTable, adminNotificationsTable, siteSettingsTable, clinicsTable, vouchersTable, medicalCentersTable } from "@workspace/db";
import { sendDoctorApprovedEmail } from "../lib/email.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number; role: string };
    if (payload.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

function phoneVariants(phone: string): string[] {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("20") && digits.length > 10 ? digits.slice(2) : digits;
  const withZero    = local.startsWith("0") ? local : "0" + local;
  const withoutZero = local.startsWith("0") ? local.slice(1) : local;
  return Array.from(new Set([withZero, withoutZero, "20"+withoutZero, "+20"+withoutZero, digits, "+"+digits]));
}

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

router.use("/admin", requireAdmin);

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
      isActive: doctorsTable.isActive,
      hasVezeetaProfile: doctorsTable.hasVezeetaProfile,
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

/* ─── GET /admin/doctors/:id/clinics ─── */
router.get("/admin/doctors/:id/clinics", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const rows = await db
    .select({
      id: clinicsTable.id,
      name: clinicsTable.name,
      address: clinicsTable.address,
      phone: clinicsTable.phone,
      fee: clinicsTable.fee,
      areaName: areasTable.name,
      cityName: citiesTable.name,
      lat: clinicsTable.lat,
      lng: clinicsTable.lng,
    })
    .from(clinicsTable)
    .leftJoin(areasTable, eq(clinicsTable.areaId, areasTable.id))
    .leftJoin(citiesTable, eq(areasTable.cityId, citiesTable.id))
    .where(eq(clinicsTable.doctorId, id));

  res.json(rows);
});

/* ─── PATCH /admin/doctors/:id/toggle-vezeeta ─── */
router.patch("/admin/doctors/:id/toggle-vezeeta", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [current] = await db.select({ hasVezeetaProfile: doctorsTable.hasVezeetaProfile }).from(doctorsTable).where(eq(doctorsTable.id, id));
  if (!current) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  const [doctor] = await db
    .update(doctorsTable)
    .set({ hasVezeetaProfile: !current.hasVezeetaProfile })
    .where(eq(doctorsTable.id, id))
    .returning();

  req.log.info({ doctorId: id, hasVezeetaProfile: doctor.hasVezeetaProfile }, "Doctor Vezeeta profile toggled");
  res.json(stringifyRow(doctor));
});

/* ─── PATCH /admin/doctors/:id/toggle-active ─── */
router.patch("/admin/doctors/:id/toggle-active", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [current] = await db.select({ isActive: doctorsTable.isActive }).from(doctorsTable).where(eq(doctorsTable.id, id));
  if (!current) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  const [doctor] = await db
    .update(doctorsTable)
    .set({ isActive: !current.isActive })
    .where(eq(doctorsTable.id, id))
    .returning();

  req.log.info({ doctorId: id, isActive: doctor.isActive }, "Doctor active status toggled");
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

/* ─── Admin Notifications ─── */

router.get("/admin/notifications", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(adminNotificationsTable)
    .orderBy(adminNotificationsTable.createdAt);
  res.json(
    rows.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })).reverse()
  );
});

router.patch("/admin/notifications/:id/read", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .update(adminNotificationsTable)
    .set({ isRead: true })
    .where(eq(adminNotificationsTable.id, id))
    .returning();

  if (!row) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json({ ...row, createdAt: row.createdAt.toISOString() });
});

router.delete("/admin/notifications", async (_req, res): Promise<void> => {
  await db.delete(adminNotificationsTable);
  res.sendStatus(204);
});

/* ─── POST /admin/users/reset-password ─── */
router.post("/admin/users/reset-password", async (req, res): Promise<void> => {
  const Schema = z.object({
    phone: z.string().min(7, "Phone is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, name: usersTable.name, phone: usersTable.phone, email: usersTable.email, role: usersTable.role })
    .from(usersTable)
    .where(inArray(usersTable.phone, phoneVariants(parsed.data.phone)))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "No account found with this phone number." });
    return;
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.update(usersTable).set({ passwordHash: hash }).where(eq(usersTable.id, user.id));

  req.log.info({ userId: user.id }, "Admin reset user password");
  res.json({ ok: true, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role } });
});

/* ─── GET /admin/users/search ─── */
router.get("/admin/users/search", async (req, res): Promise<void> => {
  const phone = String(req.query.phone ?? "").trim();
  if (!phone) {
    res.status(400).json({ error: "phone query param is required" });
    return;
  }
  const [user] = await db
    .select({ id: usersTable.id, name: usersTable.name, phone: usersTable.phone, email: usersTable.email, role: usersTable.role })
    .from(usersTable)
    .where(inArray(usersTable.phone, phoneVariants(phone)))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "No account found with this phone number." });
    return;
  }
  res.json(user);
});

/* ─── GET /admin/settings/contact ─── */
router.get("/admin/settings/contact", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteSettingsTable);
  res.json(rows);
});

/* ─── PUT /admin/settings/contact ─── */
router.put("/admin/settings/contact", async (req, res): Promise<void> => {
  const Schema = z.object({
    phone:       z.string().min(1),
    phoneSubEn:  z.string(),
    phoneSubAr:  z.string(),
    email:       z.string().min(1),
    address:     z.string().min(1),
    addressAr:   z.string(),
    hoursEn:     z.string(),
    hoursAr:     z.string(),
    daysEn:      z.string(),
    daysAr:      z.string(),
    whatsapp:    z.string(),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const d = parsed.data;
  const entries: Array<{ key: string; value: string }> = [
    { key: "contact_phone",       value: d.phone },
    { key: "contact_phone_sub_en",value: d.phoneSubEn },
    { key: "contact_phone_sub_ar",value: d.phoneSubAr },
    { key: "contact_email",       value: d.email },
    { key: "contact_address_en",  value: d.address },
    { key: "contact_address_ar",  value: d.addressAr },
    { key: "contact_hours_en",    value: d.hoursEn },
    { key: "contact_hours_ar",    value: d.hoursAr },
    { key: "contact_days_en",     value: d.daysEn },
    { key: "contact_days_ar",     value: d.daysAr },
    { key: "contact_whatsapp",    value: d.whatsapp },
  ];

  for (const entry of entries) {
    await db.insert(siteSettingsTable).values(entry)
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: entry.value } });
  }

  req.log.info("Contact settings updated");
  res.json({ message: "Contact settings saved." });
});

/* ─── GET /admin/settings ─── */
router.get("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const keys = [
    "doctor_price_3_months", "doctor_price_6_months", "doctor_price_1_year",
    "center_price_3_months", "center_price_6_months", "center_price_1_year",
    "price_3_months", "price_6_months", "price_1_year",
    "default_free_trial_days", "subscription_currency",
  ];
  const rows = await db.select().from(siteSettingsTable).where(inArray(siteSettingsTable.key, keys));
  const m: Record<string, string> = {};
  for (const r of rows) m[r.key] = r.value;
  res.json({
    doctorPrice3Months:   Number(m["doctor_price_3_months"] ?? m["price_3_months"] ?? 800),
    doctorPrice6Months:   Number(m["doctor_price_6_months"] ?? m["price_6_months"] ?? 1500),
    doctorPrice1Year:     Number(m["doctor_price_1_year"]   ?? m["price_1_year"]   ?? 2500),
    centerPrice3Months:   Number(m["center_price_3_months"] ?? 1200),
    centerPrice6Months:   Number(m["center_price_6_months"] ?? 2200),
    centerPrice1Year:     Number(m["center_price_1_year"]   ?? 3800),
    defaultFreeTrialDays: Number(m["default_free_trial_days"] ?? 14),
    currency:             m["subscription_currency"] ?? "EGP",
  });
});

/* ─── PUT /admin/settings ─── */
router.put("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const schema = z.object({
    doctorPrice3Months:   z.number().positive(),
    doctorPrice6Months:   z.number().positive(),
    doctorPrice1Year:     z.number().positive(),
    centerPrice3Months:   z.number().positive(),
    centerPrice6Months:   z.number().positive(),
    centerPrice1Year:     z.number().positive(),
    defaultFreeTrialDays: z.number().int().min(1).max(365),
    currency:             z.string().min(1).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Invalid settings data" }); return; }
  const d = parsed.data;

  const entries: { key: string; value: string }[] = [
    { key: "doctor_price_3_months", value: String(d.doctorPrice3Months) },
    { key: "doctor_price_6_months", value: String(d.doctorPrice6Months) },
    { key: "doctor_price_1_year",   value: String(d.doctorPrice1Year) },
    { key: "center_price_3_months", value: String(d.centerPrice3Months) },
    { key: "center_price_6_months", value: String(d.centerPrice6Months) },
    { key: "center_price_1_year",   value: String(d.centerPrice1Year) },
    { key: "default_free_trial_days", value: String(d.defaultFreeTrialDays) },
  ];
  if (d.currency) entries.push({ key: "subscription_currency", value: d.currency });

  for (const entry of entries) {
    await db.insert(siteSettingsTable).values(entry)
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: entry.value } });
  }

  req.log.info(d, "Platform settings updated (split pricing)");
  res.json({ message: "Settings saved." });
});

/* ─── Medical Centers (Admin) ─── */

router.get("/admin/medical-centers", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: medicalCentersTable.id,
      userId: medicalCentersTable.userId,
      name: medicalCentersTable.name,
      nameAr: medicalCentersTable.nameAr,
      type: medicalCentersTable.type,
      subType: medicalCentersTable.subType,
      phone: medicalCentersTable.phone,
      address: medicalCentersTable.address,
      bio: medicalCentersTable.bio,
      isActive: medicalCentersTable.isActive,
      isApproved: medicalCentersTable.isApproved,
      hasVezeetaProfile: medicalCentersTable.hasVezeetaProfile,
      subscriptionStatus: medicalCentersTable.subscriptionStatus,
      createdAt: medicalCentersTable.createdAt,
      email: usersTable.email,
      userPhone: usersTable.phone,
    })
    .from(medicalCentersTable)
    .leftJoin(usersTable, eq(medicalCentersTable.userId, usersTable.id))
    .orderBy(desc(medicalCentersTable.createdAt));
  res.json(stringifyDates(rows));
});

router.patch("/admin/medical-centers/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  const [center] = await db
    .update(medicalCentersTable)
    .set({ isApproved: true })
    .where(eq(medicalCentersTable.id, id))
    .returning();
  if (!center) { res.status(404).json({ error: "Center not found" }); return; }
  req.log.info({ centerId: id }, "Medical center approved");
  res.json(stringifyRow(center));
});

router.patch("/admin/medical-centers/:id/toggle-vezeeta", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  const [current] = await db.select({ hasVezeetaProfile: medicalCentersTable.hasVezeetaProfile })
    .from(medicalCentersTable).where(eq(medicalCentersTable.id, id)).limit(1);
  if (!current) { res.status(404).json({ error: "Center not found" }); return; }
  const [updated] = await db
    .update(medicalCentersTable)
    .set({ hasVezeetaProfile: !current.hasVezeetaProfile })
    .where(eq(medicalCentersTable.id, id))
    .returning();
  res.json(stringifyRow(updated));
});

/* ─── GET /admin/vouchers ─── */
router.get("/admin/vouchers", requireAdmin, async (req, res): Promise<void> => {
  const rows = await db.select().from(vouchersTable).orderBy(desc(vouchersTable.createdAt));
  res.json(rows.map(v => ({
    ...v,
    expirationDate: v.expirationDate?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  })));
});

/* ─── POST /admin/vouchers ─── */
router.post("/admin/vouchers", requireAdmin, async (req, res): Promise<void> => {
  const schema = z.object({
    code:                z.string().min(1).max(50).transform(s => s.toUpperCase()),
    discountPercentage:  z.number().min(0).max(100).default(0),
    additionalFreeDays:  z.number().int().min(0).default(0),
    expirationDate:      z.string().datetime().nullable().optional(),
    maxUses:             z.number().int().positive().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Invalid voucher data", details: parsed.error.issues }); return; }

  const { code, discountPercentage, additionalFreeDays, expirationDate, maxUses } = parsed.data;

  const [existing] = await db.select({ id: vouchersTable.id }).from(vouchersTable).where(eq(vouchersTable.code, code)).limit(1);
  if (existing) { res.status(409).json({ error: "A voucher with this code already exists." }); return; }

  const [voucher] = await db.insert(vouchersTable).values({
    code,
    discountPercentage,
    additionalFreeDays,
    expirationDate: expirationDate ? new Date(expirationDate) : null,
    maxUses: maxUses ?? null,
  }).returning();

  req.log.info({ code }, "Voucher created");
  res.status(201).json({ ...voucher, expirationDate: voucher.expirationDate?.toISOString() ?? null, createdAt: voucher.createdAt.toISOString(), updatedAt: voucher.updatedAt.toISOString() });
});

/* ─── PUT /admin/vouchers/:id ─── */
router.put("/admin/vouchers/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid voucher ID" }); return; }

  const schema = z.object({
    discountPercentage:  z.number().min(0).max(100).optional(),
    additionalFreeDays:  z.number().int().min(0).optional(),
    expirationDate:      z.string().datetime().nullable().optional(),
    isActive:            z.boolean().optional(),
    maxUses:             z.number().int().positive().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Invalid voucher data" }); return; }

  const update: Partial<{ discountPercentage: number; additionalFreeDays: number; expirationDate: Date | null; isActive: boolean; maxUses: number | null }> = {};
  if (parsed.data.discountPercentage !== undefined) update.discountPercentage = parsed.data.discountPercentage;
  if (parsed.data.additionalFreeDays !== undefined) update.additionalFreeDays = parsed.data.additionalFreeDays;
  if (parsed.data.isActive !== undefined) update.isActive = parsed.data.isActive;
  if ("maxUses" in parsed.data) update.maxUses = parsed.data.maxUses ?? null;
  if ("expirationDate" in parsed.data) update.expirationDate = parsed.data.expirationDate ? new Date(parsed.data.expirationDate) : null;

  const [voucher] = await db.update(vouchersTable).set(update).where(eq(vouchersTable.id, id)).returning();
  if (!voucher) { res.status(404).json({ error: "Voucher not found" }); return; }

  res.json({ ...voucher, expirationDate: voucher.expirationDate?.toISOString() ?? null, createdAt: voucher.createdAt.toISOString(), updatedAt: voucher.updatedAt.toISOString() });
});

/* ─── DELETE /admin/vouchers/:id ─── */
router.delete("/admin/vouchers/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid voucher ID" }); return; }
  const [deleted] = await db.delete(vouchersTable).where(eq(vouchersTable.id, id)).returning({ id: vouchersTable.id });
  if (!deleted) { res.status(404).json({ error: "Voucher not found" }); return; }
  req.log.info({ id }, "Voucher deleted");
  res.json({ message: "Voucher deleted." });
});

export default router;
