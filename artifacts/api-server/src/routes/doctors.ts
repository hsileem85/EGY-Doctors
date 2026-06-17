import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  db, doctorsTable, specialtiesTable, citiesTable, areasTable,
  clinicsTable, reviewsTable, usersTable,
} from "@workspace/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";

const router: IRouter = Router();

function makeImage(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=D4A853&size=200`;
}

function serializeDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().split("T")[0];
  return String(d);
}

/* ─── GET /doctors ─── */
router.get("/doctors", async (req, res): Promise<void> => {
  const Schema = z.object({
    q: z.string().optional(),
    specialtyId: z.coerce.number().optional(),
    cityId: z.coerce.number().optional(),
  });

  const params = Schema.safeParse(req.query);
  const { q, specialtyId, cityId } = params.success ? params.data : {};

  const conditions: ReturnType<typeof eq>[] = [
    eq(doctorsTable.accountStatus, "approved"),
  ];
  if (specialtyId) conditions.push(eq(doctorsTable.specialtyId, specialtyId));
  if (cityId) conditions.push(eq(doctorsTable.cityId, cityId));

  let rows = await db.select({
    id: doctorsTable.id,
    name: doctorsTable.name,
    bio: doctorsTable.bio,
    image: doctorsTable.image,
    fee: doctorsTable.fee,
    experience: doctorsTable.experience,
    rating: doctorsTable.rating,
    reviews: doctorsTable.reviews,
    accountStatus: doctorsTable.accountStatus,
    specialtyName: specialtiesTable.name,
    specialtyNameAr: specialtiesTable.nameAr,
    cityName: citiesTable.name,
    cityNameAr: citiesTable.nameAr,
  })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .leftJoin(citiesTable, eq(doctorsTable.cityId, citiesTable.id))
    .where(and(...conditions));

  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        (r.bio ?? "").toLowerCase().includes(lower) ||
        (r.specialtyName ?? "").toLowerCase().includes(lower),
    );
  }

  // Batch-fetch clinics
  const doctorIds = rows.map((r) => r.id);
  const allClinics = doctorIds.length > 0
    ? await db.select().from(clinicsTable).where(inArray(clinicsTable.doctorId, doctorIds))
    : [];

  const clinicsByDoctor = new Map<number, typeof allClinics>();
  for (const c of allClinics) {
    if (!clinicsByDoctor.has(c.doctorId)) clinicsByDoctor.set(c.doctorId, []);
    clinicsByDoctor.get(c.doctorId)!.push(c);
  }

  const response = rows.map((r) => {
    const doctorClinics = (clinicsByDoctor.get(r.id) ?? []).map((c) => ({
      id: c.id,
      name: c.name ?? "",
      address: c.address ?? "",
      mapUrl: c.mapUrl ?? "",
      phone: c.phone ?? "",
      fee: c.fee ?? r.fee ?? 0,
      location: "",
      areaName: "",
    }));

    return {
      id: r.id,
      name: r.name,
      specialty: r.specialtyName ?? "",
      specialtyAr: r.specialtyNameAr ?? "",
      location: r.cityName ?? "",
      cityName: r.cityName ?? "",
      cityNameAr: r.cityNameAr ?? "",
      bio: r.bio ?? "",
      image: r.image ?? makeImage(r.name),
      fee: r.fee ?? 0,
      experience: r.experience ?? null,
      rating: r.rating ?? 0,
      reviews: r.reviews ?? 0,
      reviewsCount: r.reviews ?? 0,
      accountStatus: r.accountStatus,
      mapUrl: doctorClinics[0]?.mapUrl ?? "",
      distance: "",
      clinics: doctorClinics,
      reviewList: [],
    };
  });

  res.json(response);
});

/* ─── GET /doctors/:id ─── */
router.get("/doctors/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid doctor id" });
    return;
  }

  const [row] = await db.select({
    id: doctorsTable.id,
    userId: doctorsTable.userId,
    name: doctorsTable.name,
    bio: doctorsTable.bio,
    image: doctorsTable.image,
    fee: doctorsTable.fee,
    experience: doctorsTable.experience,
    rating: doctorsTable.rating,
    reviews: doctorsTable.reviews,
    accountStatus: doctorsTable.accountStatus,
    license: doctorsTable.license,
    specialtyId: doctorsTable.specialtyId,
    cityId: doctorsTable.cityId,
    areaId: doctorsTable.areaId,
    specialtyName: specialtiesTable.name,
    specialtyNameAr: specialtiesTable.nameAr,
    cityName: citiesTable.name,
    cityNameAr: citiesTable.nameAr,
    areaName: areasTable.name,
    areaNameAr: areasTable.nameAr,
  })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .leftJoin(citiesTable, eq(doctorsTable.cityId, citiesTable.id))
    .leftJoin(areasTable, eq(doctorsTable.areaId, areasTable.id))
    .where(eq(doctorsTable.id, id))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  const clinics = await db.select().from(clinicsTable).where(eq(clinicsTable.doctorId, id));

  const enrichedClinics = await Promise.all(
    clinics.map(async (c) => {
      if (!c.areaId) return { ...c, areaName: null };
      const [area] = await db.select({ name: areasTable.name })
        .from(areasTable).where(eq(areasTable.id, c.areaId)).limit(1);
      return { ...c, areaName: area?.name ?? null };
    }),
  );

  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.doctorId, id))
    .orderBy(reviewsTable.createdAt);

  res.json({
    id: row.id,
    name: row.name,
    specialty: row.specialtyName ?? "",
    specialtyAr: row.specialtyNameAr ?? "",
    location: row.cityName ?? "",
    cityName: row.cityName ?? "",
    cityNameAr: row.cityNameAr ?? "",
    areaName: row.areaName ?? "",
    bio: row.bio ?? "",
    image: row.image ?? makeImage(row.name),
    fee: row.fee ?? 0,
    experience: row.experience ?? null,
    license: row.license ?? null,
    rating: row.rating ?? 0,
    reviews: row.reviews ?? 0,
    reviewsCount: row.reviews ?? 0,
    accountStatus: row.accountStatus,
    mapUrl: enrichedClinics[0]?.mapUrl ?? "",
    distance: "",
    clinics: enrichedClinics.map((c) => ({
      id: c.id,
      name: c.name ?? "",
      address: c.address ?? "",
      mapUrl: c.mapUrl ?? "",
      phone: c.phone ?? "",
      fee: c.fee ?? row.fee ?? 0,
      location: c.areaName ?? "",
      areaName: c.areaName ?? "",
    })),
    reviewList: reviews.map((r) => ({
      id: r.id,
      patientName: r.patientName,
      rating: r.rating,
      text: r.text ?? "",
      date: serializeDate(r.createdAt),
    })),
  });
});

/* ─── GET /doctor/profile  (own profile — requires JWT) ─── */
router.get("/doctor/profile", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let payload: { sub: number };
  try {
    payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number };
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const [doc] = await db.select({
    id: doctorsTable.id,
    name: doctorsTable.name,
    bio: doctorsTable.bio,
    image: doctorsTable.image,
    fee: doctorsTable.fee,
    experience: doctorsTable.experience,
    license: doctorsTable.license,
    specialtyId: doctorsTable.specialtyId,
    cityId: doctorsTable.cityId,
    areaId: doctorsTable.areaId,
    accountStatus: doctorsTable.accountStatus,
    onboardingStatus: doctorsTable.onboardingStatus,
    specialtyName: specialtiesTable.name,
    cityName: citiesTable.name,
  })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .leftJoin(citiesTable, eq(doctorsTable.cityId, citiesTable.id))
    .where(eq(doctorsTable.userId, payload.sub))
    .limit(1);

  if (!doc) {
    res.status(404).json({ error: "Doctor profile not found" });
    return;
  }

  const clinics = await db.select().from(clinicsTable).where(eq(clinicsTable.doctorId, doc.id));

  res.json({
    ...doc,
    clinics,
  });
});

/* ─── PUT /doctor/profile  (update own profile — requires JWT) ─── */
router.put("/doctor/profile", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let payload: { sub: number };
  try {
    payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number };
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const Schema = z.object({
    name: z.string().min(1).optional(),
    bio: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    specialtyId: z.coerce.number().optional().nullable(),
    cityId: z.coerce.number().optional().nullable(),
    areaId: z.coerce.number().optional().nullable(),
    fee: z.coerce.number().optional().nullable(),
    experience: z.coerce.number().optional().nullable(),
    license: z.string().optional().nullable(),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const [existing] = await db.select({ id: doctorsTable.id }).from(doctorsTable)
    .where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Doctor profile not found" });
    return;
  }

  const [updated] = await db.update(doctorsTable)
    .set(parsed.data)
    .where(eq(doctorsTable.userId, payload.sub))
    .returning();

  // Update user name if provided
  if (parsed.data.name) {
    await db.update(usersTable).set({ name: parsed.data.name }).where(eq(usersTable.id, payload.sub));
  }

  res.json(updated);
});

/* ─── POST /doctor/clinics  (add clinic — requires JWT) ─── */
router.post("/doctor/clinics", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let payload: { sub: number };
  try {
    payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number };
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const [doc] = await db.select({ id: doctorsTable.id }).from(doctorsTable)
    .where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doc) {
    res.status(404).json({ error: "Doctor profile not found" });
    return;
  }

  const Schema = z.object({
    name: z.string().min(1),
    address: z.string().optional().nullable(),
    mapUrl: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    fee: z.coerce.number().optional().nullable(),
    areaId: z.coerce.number().optional().nullable(),
    lat: z.coerce.number().optional().nullable(),
    lng: z.coerce.number().optional().nullable(),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const [clinic] = await db.insert(clinicsTable).values({
    doctorId: doc.id,
    ...parsed.data,
  }).returning();

  res.status(201).json(clinic);
});

/* ─── PUT /doctor/clinics/:id  (update clinic — requires JWT) ─── */
router.put("/doctor/clinics/:id", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  let payload: { sub: number };
  try { payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number }; }
  catch { res.status(401).json({ error: "Invalid token" }); return; }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const clinicId = parseInt(rawId, 10);
  if (isNaN(clinicId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [doc] = await db.select({ id: doctorsTable.id }).from(doctorsTable)
    .where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doc) { res.status(404).json({ error: "Doctor not found" }); return; }

  const Schema = z.object({
    name: z.string().min(1).optional(),
    address: z.string().optional().nullable(),
    mapUrl: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    fee: z.coerce.number().optional().nullable(),
    areaId: z.coerce.number().optional().nullable(),
    lat: z.coerce.number().optional().nullable(),
    lng: z.coerce.number().optional().nullable(),
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }

  const [updated] = await db.update(clinicsTable)
    .set(parsed.data)
    .where(and(eq(clinicsTable.id, clinicId), eq(clinicsTable.doctorId, doc.id)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Clinic not found" }); return; }
  res.json(updated);
});

/* ─── DELETE /doctor/clinics/:id  (remove clinic — requires JWT) ─── */
router.delete("/doctor/clinics/:id", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let payload: { sub: number };
  try {
    payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number };
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const clinicId = parseInt(rawId, 10);
  if (isNaN(clinicId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [doc] = await db.select({ id: doctorsTable.id }).from(doctorsTable)
    .where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doc) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  const [deleted] = await db.delete(clinicsTable)
    .where(and(eq(clinicsTable.id, clinicId), eq(clinicsTable.doctorId, doc.id)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
