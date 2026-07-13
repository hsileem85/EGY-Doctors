import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq, desc, and, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  db, medicalCentersTable, centerClinicsTable, usersTable, doctorsTable, specialtiesTable,
  clinicsTable, citiesTable, servicesTable, availabilityPeriodEnum, centerSubTypeEnum,
} from "@workspace/db";
import { logger } from "../lib/logger.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const router = Router();

interface AuthedRequest extends Request { userId: number }

function requireCenter(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" }); return;
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number; role: string };
    if (payload.role !== "medical_center") {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    (req as AuthedRequest).userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

const ProfileBody = z.object({
  name: z.string().min(1).optional(),
  nameAr: z.string().optional(),
  type: z.string().optional(),
  subType: z.enum(["POLY_CLINIC", "HOSPITAL", "LAB", "SCAN_CENTER", "VETERINARY_CLINIC"]).optional().nullable(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  bioAr: z.string().optional(),
  commercialRegistrationNumber: z.string().optional(),
  image: z.string().optional(),
  website: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  services: z.array(z.number().int()).optional(),
});

async function resolveServices(ids: number[] | null): Promise<{ id: number; name: string; nameAr: string }[]> {
  if (!ids || ids.length === 0) return [];
  const rows = await db
    .select({ id: servicesTable.id, name: servicesTable.name, nameAr: servicesTable.nameAr })
    .from(servicesTable)
    .where(inArray(servicesTable.id, ids));
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is { id: number; name: string; nameAr: string } => !!r);
}

/* ── GET /medical-centers/profile ── */
router.get("/medical-centers/profile", requireCenter, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const [center] = await db
    .select()
    .from(medicalCentersTable)
    .where(eq(medicalCentersTable.userId, userId))
    .limit(1);

  if (!center) {
    res.status(404).json({ error: "Profile not found" }); return;
  }
  res.json(center);
});

/* ── PUT /medical-centers/profile ── */
router.put("/medical-centers/profile", requireCenter, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = ProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message }); return;
  }

  const [existing] = await db
    .select({ id: medicalCentersTable.id })
    .from(medicalCentersTable)
    .where(eq(medicalCentersTable.userId, userId))
    .limit(1);

  if (!existing) {
    const [user] = await db.select({ name: usersTable.name })
      .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const [created] = await db.insert(medicalCentersTable).values({
      userId,
      name: parsed.data.name ?? user?.name ?? "Medical Center",
      ...parsed.data,
    }).returning();
    res.status(201).json(created);
    return;
  }

  const [updated] = await db
    .update(medicalCentersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(medicalCentersTable.userId, userId))
    .returning();

  res.json(updated);
});

/* ── GET /medical-centers/:id/clinics ── */
router.get("/medical-centers/:id/clinics", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const clinics = await db
    .select()
    .from(centerClinicsTable)
    .where(eq(centerClinicsTable.medicalCenterId, id))
    .orderBy(desc(centerClinicsTable.createdAt));

  res.json(clinics);
});

const ClinicBody = z.object({
  name: z.string().min(1),
  specialty: z.string().optional(),
  doctorId: z.number().int().nullable().optional(),
});

/* ── POST /medical-centers/:id/clinics ── */
router.post("/medical-centers/:id/clinics", requireCenter, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [center] = await db.select({ userId: medicalCentersTable.userId })
    .from(medicalCentersTable).where(eq(medicalCentersTable.id, id)).limit(1);
  if (!center || center.userId !== (req as AuthedRequest).userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = ClinicBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [clinic] = await db.insert(centerClinicsTable).values({
    medicalCenterId: id,
    name: parsed.data.name,
    specialty: parsed.data.specialty,
    doctorId: parsed.data.doctorId ?? null,
  }).returning();

  logger.info({ centerId: id, clinicId: clinic.id }, "Center clinic created");
  res.status(201).json(clinic);
});

/* ── PUT /medical-centers/:id/clinics/:clinicId ── */
router.put("/medical-centers/:id/clinics/:clinicId", requireCenter, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const clinicId = parseInt(req.params.clinicId as string, 10);
  if (isNaN(id) || isNaN(clinicId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [center] = await db.select({ userId: medicalCentersTable.userId })
    .from(medicalCentersTable).where(eq(medicalCentersTable.id, id)).limit(1);
  if (!center || center.userId !== (req as AuthedRequest).userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = ClinicBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db
    .update(centerClinicsTable)
    .set(parsed.data)
    .where(eq(centerClinicsTable.id, clinicId))
    .returning();

  if (!updated) { res.status(404).json({ error: "Clinic not found" }); return; }
  res.json(updated);
});

/* ── DELETE /medical-centers/:id/clinics/:clinicId ── */
router.delete("/medical-centers/:id/clinics/:clinicId", requireCenter, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const clinicId = parseInt(req.params.clinicId as string, 10);
  if (isNaN(id) || isNaN(clinicId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [center] = await db.select({ userId: medicalCentersTable.userId })
    .from(medicalCentersTable).where(eq(medicalCentersTable.id, id)).limit(1);
  if (!center || center.userId !== (req as AuthedRequest).userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(centerClinicsTable).where(eq(centerClinicsTable.id, clinicId));
  res.status(204).send();
});

/* ════════════════════════════════════════════════════
   Affiliated Doctors — managed by Medical Center
════════════════════════════════════════════════════ */

const AffiliatedDoctorBody = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().default(""),
  specialtyId: z.number().int().optional().nullable(),
  fee: z.number().int().min(0).optional().nullable(),
  schedule: z.record(z.object({ from: z.string(), to: z.string() })).optional().nullable(),
  availabilityPeriod: z.enum(availabilityPeriodEnum).optional().nullable(),
  availabilityFrom: z.string().optional().nullable(),
  availabilityTo: z.string().optional().nullable(),
  sessionsPerHour: z.coerce.number().int().min(1).max(12).optional().nullable(),
});

async function getCenterForUser(userId: number) {
  const [center] = await db
    .select({
      id: medicalCentersTable.id,
      name: medicalCentersTable.name,
      nameAr: medicalCentersTable.nameAr,
      address: medicalCentersTable.address,
      phone: medicalCentersTable.phone,
      lat: medicalCentersTable.lat,
      lng: medicalCentersTable.lng,
    })
    .from(medicalCentersTable)
    .where(eq(medicalCentersTable.userId, userId))
    .limit(1);
  return center ?? null;
}

/* ── GET /medical-centers/affiliated-doctors ── */
router.get("/medical-centers/affiliated-doctors", requireCenter, async (req, res): Promise<void> => {
  const center = await getCenterForUser((req as AuthedRequest).userId);
  if (!center) { res.status(404).json({ error: "Center not found" }); return; }

  const rows = await db
    .select({
      id: doctorsTable.id,
      name: doctorsTable.nameEn,
      nameAr: doctorsTable.name,
      specialtyId: doctorsTable.specialtyId,
      specialtyName: specialtiesTable.name,
      specialtyNameAr: specialtiesTable.nameAr,
      fee: doctorsTable.fee,
      doctorSchedule: doctorsTable.schedule,
      clinicSchedule: clinicsTable.schedule,
      availabilityPeriod: clinicsTable.availabilityPeriod,
      availabilityFrom: clinicsTable.availabilityFrom,
      availabilityTo: clinicsTable.availabilityTo,
      sessionsPerHour: clinicsTable.sessionsPerHour,
      isActive: doctorsTable.isActive,
    })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .leftJoin(clinicsTable, eq(clinicsTable.doctorId, doctorsTable.id))
    .where(eq(doctorsTable.affiliatedCenterId, center.id));

  const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  function normalizeScheduleKeys(schedule: Record<string, { from: string; to: string }> | null) {
    if (!schedule) return null;
    const out: Record<string, { from: string; to: string }> = {};
    for (const [key, val] of Object.entries(schedule)) {
      const canonical = DAY_KEYS.find((dk) => dk.toLowerCase() === key.trim().slice(0, 3).toLowerCase());
      if (canonical) out[canonical] = val;
    }
    return out;
  }

  res.json(rows.map(({ doctorSchedule, clinicSchedule, ...d }) => {
    // The clinic's schedule is authoritative (it's what the booking calendar
    // reads); fall back to the legacy doctors.schedule for older records.
    const raw = clinicSchedule ?? doctorSchedule;
    return {
      ...d,
      schedule: normalizeScheduleKeys(raw ? (JSON.parse(raw) as Record<string, { from: string; to: string }>) : null),
    };
  }));
});

/* ── POST /medical-centers/affiliated-doctors ── */
router.post("/medical-centers/affiliated-doctors", requireCenter, async (req, res): Promise<void> => {
  const center = await getCenterForUser((req as AuthedRequest).userId);
  if (!center) { res.status(404).json({ error: "Center not found" }); return; }

  const parsed = AffiliatedDoctorBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;

  const systemPhone = `sys_${center.id}_${crypto.randomBytes(4).toString("hex")}`;
  const systemHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

  const [user] = await db.insert(usersTable).values({
    name: d.name,
    phone: systemPhone,
    passwordHash: systemHash,
    role: "doctor",
  }).returning({ id: usersTable.id });

  const [doctor] = await db.insert(doctorsTable).values({
    userId: user.id,
    nameEn: d.name,
    name: d.nameAr || null,
    specialtyId: d.specialtyId ?? null,
    fee: d.fee ?? null,
    schedule: d.schedule ? JSON.stringify(d.schedule) : null,
    availabilityPeriod: d.availabilityPeriod ?? null,
    availabilityFrom: d.availabilityFrom ?? null,
    availabilityTo: d.availabilityTo ?? null,
    sessionsPerHour: d.sessionsPerHour ?? null,
    affiliatedCenterId: center.id,
    accountStatus: "approved",
    isActive: true,
  }).returning();

  // Also create a real clinic record for this doctor, using the center's
  // location/contact info, so the doctor behaves like any normal doctor
  // (appears in search with a bookable clinic) while staying annotated
  // as affiliated with this medical center via `affiliatedCenterId`.
  // The schedule/availability settings are written here too (not just
  // doctorsTable) because the booking calendar reads the *clinic's* values
  // for any doctor with a real clinic — which every affiliated doctor has.
  await db.insert(clinicsTable).values({
    doctorId: doctor.id,
    nameEn: center.name,
    name: center.nameAr ?? null,
    address: center.address ?? null,
    phone: center.phone ?? null,
    lat: center.lat ?? null,
    lng: center.lng ?? null,
    fee: d.fee ?? null,
    schedule: d.schedule ? JSON.stringify(d.schedule) : null,
    availabilityPeriod: d.availabilityPeriod ?? null,
    availabilityFrom: d.availabilityFrom ?? null,
    availabilityTo: d.availabilityTo ?? null,
    sessionsPerHour: d.sessionsPerHour ?? null,
    bookingConfirmationMethod: "automatic",
  });

  logger.info({ centerId: center.id, doctorId: doctor.id }, "Affiliated doctor + clinic created");
  res.status(201).json({
    id: doctor.id,
    name: doctor.nameEn,
    nameAr: doctor.name ?? "",
    specialtyId: doctor.specialtyId,
    specialtyName: null,
    specialtyNameAr: null,
    fee: doctor.fee,
    schedule: d.schedule ?? null,
    availabilityPeriod: doctor.availabilityPeriod,
    availabilityFrom: doctor.availabilityFrom,
    availabilityTo: doctor.availabilityTo,
    sessionsPerHour: doctor.sessionsPerHour,
    isActive: doctor.isActive,
  });
});

/* ── PUT /medical-centers/affiliated-doctors/:id ── */
router.put("/medical-centers/affiliated-doctors/:id", requireCenter, async (req, res): Promise<void> => {
  const center = await getCenterForUser((req as AuthedRequest).userId);
  if (!center) { res.status(404).json({ error: "Center not found" }); return; }

  const doctorId = parseInt(req.params.id as string, 10);
  if (isNaN(doctorId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db
    .select({ id: doctorsTable.id, affiliatedCenterId: doctorsTable.affiliatedCenterId })
    .from(doctorsTable)
    .where(eq(doctorsTable.id, doctorId))
    .limit(1);
  if (!existing || existing.affiliatedCenterId !== center.id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = AffiliatedDoctorBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;

  const [doctor] = await db
    .update(doctorsTable)
    .set({
      ...(d.name !== undefined ? { nameEn: d.name } : {}),
      ...(d.nameAr !== undefined ? { name: d.nameAr || null } : {}),
      ...(d.specialtyId !== undefined ? { specialtyId: d.specialtyId ?? null } : {}),
      ...(d.fee !== undefined ? { fee: d.fee ?? null } : {}),
      ...(d.schedule !== undefined ? { schedule: d.schedule ? JSON.stringify(d.schedule) : null } : {}),
      ...(d.availabilityPeriod !== undefined ? { availabilityPeriod: d.availabilityPeriod ?? null } : {}),
      ...(d.availabilityFrom !== undefined ? { availabilityFrom: d.availabilityFrom ?? null } : {}),
      ...(d.availabilityTo !== undefined ? { availabilityTo: d.availabilityTo ?? null } : {}),
      ...(d.sessionsPerHour !== undefined ? { sessionsPerHour: d.sessionsPerHour ?? null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(doctorsTable.id, doctorId))
    .returning();

  // Keep the doctor's linked clinic record (name/fee/schedule/availability) in
  // sync. The clinic's values are the ones actually read by the booking
  // calendar for any doctor with a real clinic, which every affiliated
  // doctor has.
  const hasClinicSync = d.name !== undefined || d.fee !== undefined || d.schedule !== undefined
    || d.availabilityPeriod !== undefined || d.availabilityFrom !== undefined
    || d.availabilityTo !== undefined || d.sessionsPerHour !== undefined;
  if (hasClinicSync) {
    await db
      .update(clinicsTable)
      .set({
        ...(d.name !== undefined ? { nameEn: center.name } : {}),
        ...(d.fee !== undefined ? { fee: d.fee ?? null } : {}),
        ...(d.schedule !== undefined ? { schedule: d.schedule ? JSON.stringify(d.schedule) : null } : {}),
        ...(d.availabilityPeriod !== undefined ? { availabilityPeriod: d.availabilityPeriod ?? null } : {}),
        ...(d.availabilityFrom !== undefined ? { availabilityFrom: d.availabilityFrom ?? null } : {}),
        ...(d.availabilityTo !== undefined ? { availabilityTo: d.availabilityTo ?? null } : {}),
        ...(d.sessionsPerHour !== undefined ? { sessionsPerHour: d.sessionsPerHour ?? null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(clinicsTable.doctorId, doctorId));
  }

  res.json({
    id: doctor.id,
    name: doctor.nameEn,
    nameAr: doctor.name ?? "",
    specialtyId: doctor.specialtyId,
    specialtyName: null,
    specialtyNameAr: null,
    fee: doctor.fee,
    schedule: d.schedule ?? null,
    availabilityPeriod: doctor.availabilityPeriod,
    availabilityFrom: doctor.availabilityFrom,
    availabilityTo: doctor.availabilityTo,
    sessionsPerHour: doctor.sessionsPerHour,
    isActive: doctor.isActive,
  });
});

/* ── DELETE /medical-centers/affiliated-doctors/:id ── */
router.delete("/medical-centers/affiliated-doctors/:id", requireCenter, async (req, res): Promise<void> => {
  const center = await getCenterForUser((req as AuthedRequest).userId);
  if (!center) { res.status(404).json({ error: "Center not found" }); return; }

  const doctorId = parseInt(req.params.id as string, 10);
  if (isNaN(doctorId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [doc] = await db
    .select({ id: doctorsTable.id, userId: doctorsTable.userId, affiliatedCenterId: doctorsTable.affiliatedCenterId })
    .from(doctorsTable)
    .where(eq(doctorsTable.id, doctorId))
    .limit(1);

  if (!doc || doc.affiliatedCenterId !== center.id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(clinicsTable).where(eq(clinicsTable.doctorId, doctorId));
  await db.delete(doctorsTable).where(eq(doctorsTable.id, doctorId));
  await db.delete(usersTable).where(eq(usersTable.id, doc.userId));

  logger.info({ centerId: center.id, doctorId }, "Affiliated doctor deleted");
  res.status(204).send();
});

/* ════════════════════════════════════════════════════
   Public Medical Centers Directory (Home page section)
════════════════════════════════════════════════════ */

/* ── GET /medical-centers/directory ── */
router.get("/medical-centers/directory", async (req, res): Promise<void> => {
  const rawSubType = (req.query.subType as string | undefined) || undefined;
  const subTypeFilter = rawSubType && (centerSubTypeEnum as ReadonlyArray<string>).includes(rawSubType)
    ? rawSubType as typeof centerSubTypeEnum[number]
    : undefined;
  const baseCondition = eq(medicalCentersTable.isApproved, true);
  const whereClause = subTypeFilter
    ? and(baseCondition, eq(medicalCentersTable.subType, subTypeFilter))
    : baseCondition;

  const centers = await db
    .select({
      id: medicalCentersTable.id,
      name: medicalCentersTable.name,
      nameAr: medicalCentersTable.nameAr,
      type: medicalCentersTable.type,
      subType: medicalCentersTable.subType,
      image: medicalCentersTable.image,
      bio: medicalCentersTable.bio,
      bioAr: medicalCentersTable.bioAr,
      address: medicalCentersTable.address,
      phone: medicalCentersTable.phone,
      lat: medicalCentersTable.lat,
      lng: medicalCentersTable.lng,
      cityName: citiesTable.name,
      cityNameAr: citiesTable.nameAr,
      services: medicalCentersTable.services,
    })
    .from(medicalCentersTable)
    .leftJoin(citiesTable, eq(medicalCentersTable.cityId, citiesTable.id))
    .where(whereClause)
    .orderBy(desc(medicalCentersTable.createdAt));

  if (centers.length === 0) { res.json([]); return; }

  const centerIds = centers.map(c => c.id);
  const doctorRows = await db
    .select({
      centerId: doctorsTable.affiliatedCenterId,
      id: doctorsTable.id,
      name: doctorsTable.nameEn,
      nameAr: doctorsTable.name,
      specialtyName: specialtiesTable.name,
      specialtyNameAr: specialtiesTable.nameAr,
    })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .where(and(inArray(doctorsTable.affiliatedCenterId, centerIds), eq(doctorsTable.isActive, true)));

  const doctorsByCenter = new Map<number, typeof doctorRows>();
  for (const row of doctorRows) {
    if (row.centerId == null) continue;
    const list = doctorsByCenter.get(row.centerId) ?? [];
    list.push(row);
    doctorsByCenter.set(row.centerId, list);
  }

  const allServiceIds = Array.from(new Set(centers.flatMap(c => c.services ?? [])));
  const serviceRows = allServiceIds.length > 0
    ? await db.select({ id: servicesTable.id, name: servicesTable.name, nameAr: servicesTable.nameAr })
        .from(servicesTable).where(inArray(servicesTable.id, allServiceIds))
    : [];
  const serviceById = new Map(serviceRows.map((r) => [r.id, r]));

  res.json(centers.map(c => {
    const doctors = doctorsByCenter.get(c.id) ?? [];
    const specialties = Array.from(new Map(
      doctors
        .filter(d => d.specialtyName)
        .map(d => [d.specialtyName, { name: d.specialtyName, nameAr: d.specialtyNameAr }]),
    ).values());
    return {
      id: c.id,
      name: c.name,
      nameAr: c.nameAr,
      type: c.type,
      subType: c.subType,
      image: c.image,
      bio: c.bio,
      bioAr: c.bioAr,
      address: c.address,
      phone: c.phone,
      lat: c.lat,
      lng: c.lng,
      cityName: c.cityName,
      cityNameAr: c.cityNameAr,
      specialties,
      doctors: doctors.map(d => ({ id: d.id, name: d.name, nameAr: d.nameAr })),
      doctorsCount: doctors.length,
      services: (c.services ?? []).map((id) => serviceById.get(id)).filter((s): s is { id: number; name: string; nameAr: string } => !!s),
    };
  }));
});

/* ── GET /medical-centers/:id — public profile ── */
router.get("/medical-centers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [center] = await db
    .select({
      id: medicalCentersTable.id,
      name: medicalCentersTable.name,
      nameAr: medicalCentersTable.nameAr,
      type: medicalCentersTable.type,
      subType: medicalCentersTable.subType,
      image: medicalCentersTable.image,
      bio: medicalCentersTable.bio,
      bioAr: medicalCentersTable.bioAr,
      address: medicalCentersTable.address,
      phone: medicalCentersTable.phone,
      website: medicalCentersTable.website,
      facebook: medicalCentersTable.facebook,
      instagram: medicalCentersTable.instagram,
      lat: medicalCentersTable.lat,
      lng: medicalCentersTable.lng,
      cityName: citiesTable.name,
      cityNameAr: citiesTable.nameAr,
      services: medicalCentersTable.services,
      isApproved: medicalCentersTable.isApproved,
    })
    .from(medicalCentersTable)
    .leftJoin(citiesTable, eq(medicalCentersTable.cityId, citiesTable.id))
    .where(eq(medicalCentersTable.id, id))
    .limit(1);

  if (!center || !center.isApproved) { res.status(404).json({ error: "Medical center not found" }); return; }

  const doctors = await db
    .select({
      id: doctorsTable.id,
      name: doctorsTable.nameEn,
      nameAr: doctorsTable.name,
      specialtyName: specialtiesTable.name,
      specialtyNameAr: specialtiesTable.nameAr,
    })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .where(and(eq(doctorsTable.affiliatedCenterId, center.id), eq(doctorsTable.isActive, true)));

  const specialties = Array.from(new Map(
    doctors
      .filter(d => d.specialtyName)
      .map(d => [d.specialtyName, { name: d.specialtyName, nameAr: d.specialtyNameAr }]),
  ).values());

  const { isApproved: _isApproved, ...rest } = center;
  res.json({
    ...rest,
    specialties,
    doctors: doctors.map(d => ({
      id: d.id,
      name: d.name,
      nameAr: d.nameAr,
      specialtyName: d.specialtyName,
      specialtyNameAr: d.specialtyNameAr,
    })),
    doctorsCount: doctors.length,
    services: await resolveServices(center.services),
  });
});

export default router;
