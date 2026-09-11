import { Router, type IRouter, type Request } from "express";
import { eq, and, inArray, avg, count, sql, asc, gte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  db, doctorsTable, specialtiesTable, citiesTable, areasTable,
  clinicsTable, reviewsTable, usersTable, adminNotificationsTable, appointmentsTable, systemSettingsTable, walletsTable, walletTransactionsTable,
  doctorFollowsTable, centerClinicsTable, medicalCentersTable, servicesTable, availabilityPeriodEnum,
} from "@workspace/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";

const router: IRouter = Router();
const centerCitiesTable = alias(citiesTable, "center_cities");

async function resolveServiceIds(idLists: (number[] | null)[]): Promise<Map<number, { id: number; name: string; nameAr: string }>> {
  const allIds = Array.from(new Set(idLists.flatMap((ids) => ids ?? [])));
  if (allIds.length === 0) return new Map();
  const rows = await db
    .select({ id: servicesTable.id, name: servicesTable.name, nameAr: servicesTable.nameAr })
    .from(servicesTable)
    .where(inArray(servicesTable.id, allIds));
  return new Map(rows.map((r) => [r.id, r]));
}

function makeImage(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=D4A853&size=200`;
}

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Normalizes a schedule object's day keys to canonical casing ("MON", "tue" -> "Mon", "Tue", ...),
 * so schedules saved with different key casing (e.g. affiliated-doctor form previously using "MON") still resolve. */
function normalizeScheduleKeys<T>(schedule: Record<string, T> | null): Record<string, T> | null {
  if (!schedule) return null;
  const out: Record<string, T> = {};
  for (const [key, val] of Object.entries(schedule)) {
    const canonical = DAY_KEYS.find((d) => d.toLowerCase() === key.trim().slice(0, 3).toLowerCase());
    if (canonical) out[canonical] = val;
  }
  return out;
}

function serializeDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().split("T")[0];
  return String(d);
}

/* ─── Haversine distance (km) between two lat/lng points ─── */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── GET /doctors ─── */
router.get("/doctors", async (req, res): Promise<void> => {
  const Schema = z.object({
    q: z.string().optional(),
    specialtyId: z.coerce.number().optional(),
    cityId: z.coerce.number().optional(),
    areaId: z.coerce.number().optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
  });

  const params = Schema.safeParse(req.query);
  const { q, specialtyId, cityId, areaId, lat, lng } = params.success ? params.data : {} as Record<string, undefined>;

  const [financialSettings] = await db.select({
    minDoctorWalletBalance: systemSettingsTable.minDoctorWalletBalance,
  }).from(systemSettingsTable).where(eq(systemSettingsTable.id, 1)).limit(1);
  const minWallet = financialSettings?.minDoctorWalletBalance ?? 50;
  const conditions = [
    eq(doctorsTable.accountStatus, "approved"),
    eq(doctorsTable.isActive, true),
    sql`EXISTS (
      SELECT 1 FROM ${walletsTable} w
      WHERE w.owner_type = 'DOCTOR' AND w.owner_id = CAST(${doctorsTable.userId} AS TEXT)
        AND w.balance >= ${minWallet}
    )`,
  ];
  if (specialtyId) conditions.push(eq(doctorsTable.specialtyId, specialtyId));
  if (cityId) conditions.push(eq(doctorsTable.cityId, cityId));
  if (areaId) {
    const doctorIdsInArea = db
      .select({ id: clinicsTable.doctorId })
      .from(clinicsTable)
      .where(eq(clinicsTable.areaId, areaId));
    conditions.push(inArray(doctorsTable.id, doctorIdsInArea));
  }

  let rows = await db.select({
    id: doctorsTable.id,
    nameEn: doctorsTable.nameEn,
    nameAr: doctorsTable.name,
    bioEn: doctorsTable.bioEn,
    bioAr: doctorsTable.bio,
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
    affiliatedCenterId: doctorsTable.affiliatedCenterId,
    affiliatedCenterName: medicalCentersTable.name,
    affiliatedCenterNameAr: medicalCentersTable.nameAr,
    affiliatedCenterPhone: medicalCentersTable.phone,
    affiliatedCenterAddress: medicalCentersTable.address,
    affiliatedCenterLat: medicalCentersTable.lat,
    affiliatedCenterLng: medicalCentersTable.lng,
    affiliatedCenterCityName: centerCitiesTable.name,
    affiliatedCenterServices: medicalCentersTable.services,
  })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .leftJoin(citiesTable, eq(doctorsTable.cityId, citiesTable.id))
    .leftJoin(medicalCentersTable, eq(doctorsTable.affiliatedCenterId, medicalCentersTable.id))
    .leftJoin(centerCitiesTable, eq(medicalCentersTable.cityId, centerCitiesTable.id))
    .where(and(...conditions));

  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.nameEn.toLowerCase().includes(lower) ||
        (r.nameAr ?? "").toLowerCase().includes(lower) ||
        (r.bioEn ?? "").toLowerCase().includes(lower) ||
        (r.specialtyName ?? "").toLowerCase().includes(lower),
    );
  }

  // Batch-fetch clinics with area join
  const doctorIds = rows.map((r) => r.id);
  const allClinics = doctorIds.length > 0
    ? await db
        .select({
          id: clinicsTable.id,
          doctorId: clinicsTable.doctorId,
          nameEn: clinicsTable.nameEn,
          nameAr: clinicsTable.name,
          address: clinicsTable.address,
          mapUrl: clinicsTable.mapUrl,
          phone: clinicsTable.phone,
          fee: clinicsTable.fee,
          areaId: clinicsTable.areaId,
          areaName: areasTable.name,
          lat: clinicsTable.lat,
          lng: clinicsTable.lng,
        })
        .from(clinicsTable)
        .leftJoin(areasTable, eq(clinicsTable.areaId, areasTable.id))
        .where(inArray(clinicsTable.doctorId, doctorIds))
    : [];

  const clinicsByDoctor = new Map<number, typeof allClinics>();
  for (const c of allClinics) {
    if (!clinicsByDoctor.has(c.doctorId)) clinicsByDoctor.set(c.doctorId, []);
    clinicsByDoctor.get(c.doctorId)!.push(c);
  }

  // Batch-fetch poly clinic membership for all doctors
  const polyClinicByDoctor = new Map<number, { id: number; name: string; nameAr: string | null }>();
  if (doctorIds.length > 0) {
    const pcRows = await db
      .select({
        doctorId: centerClinicsTable.doctorId,
        centerId: medicalCentersTable.id,
        centerName: medicalCentersTable.name,
        centerNameAr: medicalCentersTable.nameAr,
      })
      .from(centerClinicsTable)
      .innerJoin(medicalCentersTable, eq(centerClinicsTable.medicalCenterId, medicalCentersTable.id))
      .where(and(
        inArray(centerClinicsTable.doctorId, doctorIds),
        eq(medicalCentersTable.subType, "POLY_CLINIC"),
      ));
    for (const r of pcRows) {
      if (r.doctorId !== null && !polyClinicByDoctor.has(r.doctorId)) {
        polyClinicByDoctor.set(r.doctorId, { id: r.centerId, name: r.centerName, nameAr: r.centerNameAr ?? null });
      }
    }
  }

  const serviceById = await resolveServiceIds(rows.map((r) => r.affiliatedCenterServices));

  const response = rows.map((r) => {
    const doctorClinics = (clinicsByDoctor.get(r.id) ?? []).map((c) => ({
      id: c.id,
      name: c.nameEn ?? "",
      nameAr: c.nameAr ?? "",
      address: c.address ?? "",
      mapUrl: c.mapUrl ?? "",
      phone: c.phone ?? "",
      fee: c.fee ?? r.fee ?? 0,
      location: c.areaName ?? "",
      areaName: c.areaName ?? "",
      lat: c.lat ?? null,
      lng: c.lng ?? null,
    }));

    // Calculate nearest clinic distance if user coords provided
    let distanceKm: number | null = null;
    if (lat != null && lng != null) {
      for (const c of doctorClinics) {
        if (c.lat != null && c.lng != null) {
          const d = haversineKm(lat, lng, c.lat, c.lng);
          if (distanceKm === null || d < distanceKm) distanceKm = d;
        }
      }
    }

    const distanceLabel =
      distanceKm === null
        ? ""
        : distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`;

    return {
      id: r.id,
      name: r.nameEn,
      nameAr: r.nameAr ?? "",
      specialty: r.specialtyName ?? "",
      specialtyAr: r.specialtyNameAr ?? "",
      location: r.cityName ?? "",
      cityName: r.cityName ?? "",
      cityNameAr: r.cityNameAr ?? "",
      bio: r.bioEn ?? "",
      bioAr: r.bioAr ?? "",
      image: r.image ?? makeImage(r.nameEn),
      fee: r.fee ?? 0,
      experience: r.experience ?? null,
      rating: r.rating ?? 0,
      reviews: r.reviews ?? 0,
      reviewsCount: r.reviews ?? 0,
      accountStatus: r.accountStatus,
      mapUrl: doctorClinics[0]?.mapUrl ?? "",
      distance: distanceLabel,
      distanceKm,
      clinics: doctorClinics,
      reviewList: [],
      polyClinic: polyClinicByDoctor.get(r.id) ?? null,
      affiliatedCenter: r.affiliatedCenterId && r.affiliatedCenterName
        ? {
            id: r.affiliatedCenterId,
            name: r.affiliatedCenterName,
            nameAr: r.affiliatedCenterNameAr ?? null,
            phone: r.affiliatedCenterPhone ?? null,
            address: r.affiliatedCenterAddress ?? null,
            lat: r.affiliatedCenterLat ?? null,
            lng: r.affiliatedCenterLng ?? null,
            cityName: r.affiliatedCenterCityName ?? null,
            services: (r.affiliatedCenterServices ?? []).map((id) => serviceById.get(id)).filter((s): s is { id: number; name: string; nameAr: string } => !!s),
          }
        : null,
    };
  });

  // Sort by distance when user coords supplied, otherwise leave as-is
  if (lat != null && lng != null) {
    response.sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }

  res.set("Cache-Control", "no-store").json(response);
});

/* ─── GET /doctors/patients ─── */
router.get("/doctors/patients", async (req, res): Promise<void> => {
  const result = await requireDoctor(req.headers.authorization);
  if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
  const { doctorRow } = result;

  const rows = await db.select({
    patientName: appointmentsTable.patientName,
    patientPhone: appointmentsTable.patientPhone,
    patientUserId: appointmentsTable.patientUserId,
    appointmentDate: appointmentsTable.appointmentDate,
    status: appointmentsTable.status,
  }).from(appointmentsTable)
    .where(eq(appointmentsTable.doctorId, doctorRow.id))
    .orderBy(appointmentsTable.appointmentDate);

  const patientMap = new Map<string, {
    patientName: string; patientPhone: string; patientUserId: number | null;
    lastVisit: string; totalVisits: number; status: typeof appointmentsTable.status.enumValues[number];
  }>();

  for (const row of rows) {
    const key = row.patientPhone;
    const appointmentDate = String(row.appointmentDate);
    const existing = patientMap.get(key);
    if (!existing) {
      patientMap.set(key, {
        patientName: row.patientName,
        patientPhone: row.patientPhone,
        patientUserId: row.patientUserId,
        lastVisit: appointmentDate,
        totalVisits: 1,
        status: row.status,
      });
    } else {
      existing.totalVisits++;
      if (appointmentDate > existing.lastVisit) {
        existing.lastVisit = appointmentDate;
        existing.status = row.status;
      }
    }
  }

  res.json(Array.from(patientMap.values()));
});

/* ─── GET /doctors/:id ─── */
router.get("/doctors/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid doctor id" });
    return;
  }

  /* Resolve optional caller identity for isFollowing */
  let callerId: number | null = null;
  let callerRole: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const p = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number; role?: string };
      callerId = p.sub;
      callerRole = p.role ?? null;
    } catch { /* unauthenticated — callerId stays null */ }
  }

  const [row] = await db.select({
    id: doctorsTable.id,
    userId: doctorsTable.userId,
    nameEn: doctorsTable.nameEn,
    nameAr: doctorsTable.name,
    bioEn: doctorsTable.bioEn,
    bioAr: doctorsTable.bio,
    image: doctorsTable.image,
    fee: doctorsTable.fee,
    experience: doctorsTable.experience,
    rating: doctorsTable.rating,
    reviews: doctorsTable.reviews,
    accountStatus: doctorsTable.accountStatus,
    isActive: doctorsTable.isActive,
    license: doctorsTable.license,
    specialtyId: doctorsTable.specialtyId,
    cityId: doctorsTable.cityId,
    areaId: doctorsTable.areaId,
    schedule: doctorsTable.schedule,
    availabilityPeriod: doctorsTable.availabilityPeriod,
    availabilityFrom: doctorsTable.availabilityFrom,
    availabilityTo: doctorsTable.availabilityTo,
    sessionsPerHour: doctorsTable.sessionsPerHour,
    specialtyName: specialtiesTable.name,
    specialtyNameAr: specialtiesTable.nameAr,
    cityName: citiesTable.name,
    cityNameAr: citiesTable.nameAr,
    areaName: areasTable.name,
    areaNameAr: areasTable.nameAr,
    websiteUrl: doctorsTable.websiteUrl,
    facebookUrl: doctorsTable.facebookUrl,
    instagramUrl: doctorsTable.instagramUrl,
    tiktokUrl: doctorsTable.tiktokUrl,
    youtubeUrl: doctorsTable.youtubeUrl,
    xUrl: doctorsTable.xUrl,
    affiliatedCenterId: doctorsTable.affiliatedCenterId,
    affiliatedCenterName: medicalCentersTable.name,
    affiliatedCenterNameAr: medicalCentersTable.nameAr,
    affiliatedCenterPhone: medicalCentersTable.phone,
    affiliatedCenterAddress: medicalCentersTable.address,
    affiliatedCenterLat: medicalCentersTable.lat,
    affiliatedCenterLng: medicalCentersTable.lng,
    affiliatedCenterCityName: centerCitiesTable.name,
    affiliatedCenterServices: medicalCentersTable.services,
  })
    .from(doctorsTable)
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .leftJoin(citiesTable, eq(doctorsTable.cityId, citiesTable.id))
    .leftJoin(areasTable, eq(doctorsTable.areaId, areasTable.id))
    .leftJoin(medicalCentersTable, eq(doctorsTable.affiliatedCenterId, medicalCentersTable.id))
    .leftJoin(centerCitiesTable, eq(medicalCentersTable.cityId, centerCitiesTable.id))
    .where(eq(doctorsTable.id, id))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  const mayBypassVisibility = callerRole === "admin" || callerId === row.userId;
  if (!mayBypassVisibility) {
    const [settings] = await db.select({ minimum: systemSettingsTable.minDoctorWalletBalance })
      .from(systemSettingsTable).where(eq(systemSettingsTable.id, 1)).limit(1);
    const [visibleWallet] = await db.select({ id: walletsTable.id }).from(walletsTable)
      .where(and(
        eq(walletsTable.ownerType, "DOCTOR"),
        eq(walletsTable.ownerId, String(row.userId)),
        gte(walletsTable.balance, settings?.minimum ?? 50),
      )).limit(1);
    if (row.accountStatus !== "approved" || !row.isActive || !visibleWallet) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
  }

  const enrichedClinics = await db
    .select({
      id: clinicsTable.id,
      doctorId: clinicsTable.doctorId,
      nameEn: clinicsTable.nameEn,
      nameAr: clinicsTable.name,
      address: clinicsTable.address,
      mapUrl: clinicsTable.mapUrl,
      phone: clinicsTable.phone,
      fee: clinicsTable.fee,
      areaId: clinicsTable.areaId,
      lat: clinicsTable.lat,
      lng: clinicsTable.lng,
      schedule: clinicsTable.schedule,
      availabilityPeriod: clinicsTable.availabilityPeriod,
      availabilityFrom: clinicsTable.availabilityFrom,
      availabilityTo: clinicsTable.availabilityTo,
      sessionsPerHour: clinicsTable.sessionsPerHour,
       acceptedPaymentMethods: clinicsTable.acceptedPaymentMethods,
      bookingConfirmationMethod: clinicsTable.bookingConfirmationMethod,
      areaName: areasTable.name,
    })
    .from(clinicsTable)
    .leftJoin(areasTable, eq(clinicsTable.areaId, areasTable.id))
    .where(eq(clinicsTable.doctorId, id));

  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.doctorId, id))
    .orderBy(reviewsTable.createdAt);

  // Fetch poly clinic membership for this doctor
  const [pcRow] = await db
    .select({
      centerId: medicalCentersTable.id,
      centerName: medicalCentersTable.name,
      centerNameAr: medicalCentersTable.nameAr,
    })
    .from(centerClinicsTable)
    .innerJoin(medicalCentersTable, eq(centerClinicsTable.medicalCenterId, medicalCentersTable.id))
    .where(and(
      eq(centerClinicsTable.doctorId, id),
      eq(medicalCentersTable.subType, "POLY_CLINIC"),
    ))
    .limit(1);
  const polyClinic = pcRow ? { id: pcRow.centerId, name: pcRow.centerName, nameAr: pcRow.centerNameAr ?? null } : null;

  /* isFollowing — only meaningful when caller is authenticated */
  let isFollowing = false;
  if (callerId !== null) {
    const [follow] = await db
      .select({ id: doctorFollowsTable.id })
      .from(doctorFollowsTable)
      .where(and(
        eq(doctorFollowsTable.followerId, callerId),
        eq(doctorFollowsTable.doctorId, id),
      ))
      .limit(1);
    isFollowing = !!follow;
  }

  res.json({
    id: row.id,
    name: row.nameEn,
    nameAr: row.nameAr ?? "",
    specialty: row.specialtyName ?? "",
    specialtyAr: row.specialtyNameAr ?? "",
    location: row.cityName ?? "",
    cityName: row.cityName ?? "",
    cityNameAr: row.cityNameAr ?? "",
    areaName: row.areaName ?? "",
    bio: row.bioEn ?? "",
    bioAr: row.bioAr ?? "",
    image: row.image ?? makeImage(row.nameEn),
    fee: row.fee ?? 0,
    experience: row.experience ?? null,
    license: row.license ?? null,
    rating: row.rating ?? 0,
    reviews: row.reviews ?? 0,
    reviewsCount: row.reviews ?? 0,
    accountStatus: row.accountStatus,
    mapUrl: enrichedClinics[0]?.mapUrl ?? "",
    distance: "",
    websiteUrl: row.websiteUrl ?? null,
    facebookUrl: row.facebookUrl ?? null,
    instagramUrl: row.instagramUrl ?? null,
    tiktokUrl: row.tiktokUrl ?? null,
    youtubeUrl: row.youtubeUrl ?? null,
    xUrl: row.xUrl ?? null,
    isFollowing,
    polyClinic,
    affiliatedCenter: row.affiliatedCenterId && row.affiliatedCenterName
      ? {
          id: row.affiliatedCenterId,
          name: row.affiliatedCenterName,
          nameAr: row.affiliatedCenterNameAr ?? null,
          phone: row.affiliatedCenterPhone ?? null,
          address: row.affiliatedCenterAddress ?? null,
          lat: row.affiliatedCenterLat ?? null,
          lng: row.affiliatedCenterLng ?? null,
          cityName: row.affiliatedCenterCityName ?? null,
          services: Array.from((await resolveServiceIds([row.affiliatedCenterServices])).values()),
        }
      : null,
    schedule: normalizeScheduleKeys(row.schedule ? JSON.parse(row.schedule) : null),
    availabilityPeriod: row.availabilityPeriod ?? null,
    availabilityFrom: row.availabilityFrom ?? null,
    availabilityTo: row.availabilityTo ?? null,
    sessionsPerHour: row.sessionsPerHour ?? null,
    clinics: enrichedClinics.map((c) => ({
      id: c.id,
      name: c.nameEn ?? "",
      nameAr: c.nameAr ?? "",
      address: c.address ?? "",
      mapUrl: c.mapUrl ?? "",
      phone: c.phone ?? "",
      fee: c.fee ?? row.fee ?? 0,
      location: c.areaName ?? "",
      areaName: c.areaName ?? "",
      lat: c.lat ?? null,
      lng: c.lng ?? null,
      schedule: normalizeScheduleKeys(c.schedule ? JSON.parse(c.schedule) : null),
      availabilityPeriod: c.availabilityPeriod ?? null,
      availabilityFrom: c.availabilityFrom ?? null,
      availabilityTo: c.availabilityTo ?? null,
      sessionsPerHour: c.sessionsPerHour ?? null,
      acceptedPaymentMethods: c.acceptedPaymentMethods ?? ["CASH", "CARD", "WALLET"],
      bookingConfirmationMethod: (c.bookingConfirmationMethod as "automatic" | "manual" | null) ?? "automatic",
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

/* ─── POST /doctors/:id/reviews ─── */
const insertReviewBodySchema = z.object({
  patientName: z.string().min(1).max(255),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000).optional(),
  appointmentId: z.coerce.number().int().positive().optional(),
});

function patientAuth(req: Request): { sub: number; role: string } | null {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  try { return jwt.verify(h.slice(7), JWT_SECRET) as unknown as { sub: number; role: string }; } catch { return null; }
}

router.get("/patient/review-eligibility", async (req, res): Promise<void> => {
  const payload = patientAuth(req);
  if (!payload || payload.role !== "patient") { res.status(401).json({ error: "Unauthorized" }); return; }
  const [settings] = await db.select({
    delay: systemSettingsTable.reviewPromptDelayHours,
    cashback: systemSettingsTable.reviewCashbackAmount,
  }).from(systemSettingsTable).where(eq(systemSettingsTable.id, 1)).limit(1);
  const delay = settings?.delay ?? 6;
  const rows = await db.select({
    appointmentId: appointmentsTable.id,
    doctorId: appointmentsTable.doctorId,
    doctorName: usersTable.name,
    completedAt: appointmentsTable.completedAt,
  }).from(appointmentsTable)
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .leftJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
    .where(and(eq(appointmentsTable.patientUserId, payload.sub), eq(appointmentsTable.status, "completed")))
    .orderBy(asc(appointmentsTable.completedAt));
  const now = Date.now();
  for (const due of rows) {
    if (!due.completedAt || now < due.completedAt.getTime() + delay * 3600000) continue;
    const [review] = await db.select({ id: reviewsTable.id }).from(reviewsTable)
      .where(eq(reviewsTable.appointmentId, due.appointmentId)).limit(1);
    if (review) continue;
    res.json({ appointmentId: due.appointmentId, doctorId: due.doctorId, doctorName: due.doctorName ?? "Doctor", cashbackAmount: settings?.cashback ?? 25 });
    return;
  }
  res.json(null);
});

router.post("/doctors/:id/reviews", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid doctor id" }); return; }

  const parsed = insertReviewBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const { patientName, rating, text, appointmentId } = parsed.data;

  // Resolve caller identity from JWT when present
  let patientUserId: number | null = null;
  const payload = patientAuth(req);
  if (payload) {
      if (payload.role !== "patient") {
        res.status(403).json({ error: "Doctors are not allowed to submit or edit reviews." });
        return;
      }
      patientUserId = payload.sub;
  }
  if (appointmentId && (!payload || payload.role !== "patient")) { res.status(401).json({ error: "Authenticated patient required" }); return; }
  try {
    const result = await db.transaction(async (tx) => {
      let reward = 0;
      if (appointmentId) {
        const [appointment] = await tx.select().from(appointmentsTable)
          .where(and(eq(appointmentsTable.id, appointmentId), eq(appointmentsTable.patientUserId, patientUserId!))).limit(1);
        if (!appointment || appointment.doctorId !== id || appointment.status !== "completed" || !appointment.completedAt) throw new Error("REVIEW_NOT_ELIGIBLE");
        const [settings] = await tx.select().from(systemSettingsTable).where(eq(systemSettingsTable.id, 1)).limit(1);
        const delay = settings?.reviewPromptDelayHours ?? 6;
        if (Date.now() < appointment.completedAt.getTime() + delay * 3600000) throw new Error("REVIEW_NOT_DUE");
        reward = settings?.reviewCashbackAmount ?? 25;
      }
      const [review] = await tx.insert(reviewsTable).values({ appointmentId: appointmentId ?? null, doctorId: id, patientName, rating, text, patientUserId }).returning();
      if (appointmentId && reward > 0) {
        await tx.insert(walletsTable).values({ ownerType: "PATIENT", ownerId: String(patientUserId) }).onConflictDoNothing({ target: [walletsTable.ownerType, walletsTable.ownerId] });
        const [wallet] = await tx.update(walletsTable).set({ balance: sql`${walletsTable.balance} + ${reward}`, updatedAt: new Date() })
          .where(and(eq(walletsTable.ownerType, "PATIENT"), eq(walletsTable.ownerId, String(patientUserId)))).returning();
        if (!wallet) throw new Error("PATIENT_WALLET_NOT_FOUND");
        await tx.insert(walletTransactionsTable).values({
          walletId: wallet.id, type: "CREDIT", category: "CASHBACK_REWARD", amount: reward,
          balancePost: wallet.balance, referenceId: `review:${appointmentId}`, description: "Review cashback reward",
        });
      }
      const [agg] = await tx.select({ avgRating: avg(reviewsTable.rating), total: count() }).from(reviewsTable).where(eq(reviewsTable.doctorId, id));
      await tx.update(doctorsTable).set({ rating: agg.avgRating ? Math.round(parseFloat(agg.avgRating) * 10) / 10 : 0, reviews: agg.total ?? 0 }).where(eq(doctorsTable.id, id));
      return { reward, review };
    });
    res.status(201).json({ ok: true, cashbackAmount: result.reward });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "REVIEW_NOT_ELIGIBLE" || message === "REVIEW_NOT_DUE") { res.status(409).json({ error: "Appointment is not eligible for this review" }); return; }
    if ((error as { code?: string })?.code === "23505") { res.status(409).json({ error: "This appointment has already been reviewed" }); return; }
    throw error;
  }
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
    nameEn: doctorsTable.nameEn,
    nameAr: doctorsTable.name,
    bioEn: doctorsTable.bioEn,
    bioAr: doctorsTable.bio,
    image: doctorsTable.image,
    fee: doctorsTable.fee,
    experience: doctorsTable.experience,
    license: doctorsTable.license,
    specialtyId: doctorsTable.specialtyId,
    cityId: doctorsTable.cityId,
    areaId: doctorsTable.areaId,
    accountStatus: doctorsTable.accountStatus,
    isSubmittedForReview: doctorsTable.isSubmittedForReview,
    onboardingStatus: doctorsTable.onboardingStatus,
    availabilityPeriod: doctorsTable.availabilityPeriod,
    availabilityFrom: doctorsTable.availabilityFrom,
    availabilityTo: doctorsTable.availabilityTo,
    sessionsPerHour: doctorsTable.sessionsPerHour,
    specialtyName: specialtiesTable.name,
    cityName: citiesTable.name,
    websiteUrl: doctorsTable.websiteUrl,
    facebookUrl: doctorsTable.facebookUrl,
    instagramUrl: doctorsTable.instagramUrl,
    tiktokUrl: doctorsTable.tiktokUrl,
    youtubeUrl: doctorsTable.youtubeUrl,
    xUrl: doctorsTable.xUrl,
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
    name: doc.nameEn,
    bio: doc.bioEn ?? "",
    isSubmittedForReview: doc.isSubmittedForReview ?? false,
    clinics: clinics.map((c) => ({
      ...c,
      name: c.nameEn,
      schedule: normalizeScheduleKeys(c.schedule ? JSON.parse(c.schedule) : null),
    })),
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
    nameAr: z.string().optional().nullable(),
    bio: z.string().min(1, "Biography (English) is required"),
    bioAr: z.string().min(1, "Biography (Arabic) is required"),
    image: z.string().optional().nullable(),
    specialtyId: z.coerce.number().optional().nullable(),
    cityId: z.coerce.number().optional().nullable(),
    areaId: z.coerce.number().optional().nullable(),
    fee: z.coerce.number().optional().nullable(),
    experience: z.coerce.number().optional().nullable(),
    license: z.string().optional().nullable(),
    websiteUrl: z.string().optional().nullable(),
    facebookUrl: z.string().optional().nullable(),
    instagramUrl: z.string().optional().nullable(),
    tiktokUrl: z.string().optional().nullable(),
    youtubeUrl: z.string().optional().nullable(),
    xUrl: z.string().optional().nullable(),
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

  // Map frontend field names to DB column names
  const { name, nameAr, bio, bioAr, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (name !== undefined) updateData.nameEn = name;
  if (nameAr !== undefined) updateData.name = nameAr;
  if (bio !== undefined) updateData.bioEn = bio;
  if (bioAr !== undefined) updateData.bio = bioAr;

  const [updated] = await db.update(doctorsTable)
    .set(updateData)
    .where(eq(doctorsTable.userId, payload.sub))
    .returning();

  // Update user name if provided
  if (name) {
    await db.update(usersTable).set({ name }).where(eq(usersTable.id, payload.sub));
  }

  res.json({ ...updated, name: updated.nameEn, bio: updated.bioEn ?? "" });
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
    name: z.string().min(1).optional().nullable(),
    nameAr: z.string().optional().nullable(),
    address: z.string().min(1, "Clinic address is required"),
    mapUrl: z.string().optional().nullable(),
    phone: z.string().min(1, "Clinic phone number is required"),
    fee: z.coerce.number().optional().nullable(),
    followUpDays: z.coerce.number().int().min(0).optional().nullable(),
    followUpPrice: z.coerce.number().int().min(0).optional().nullable(),
    bookingConfirmationMethod: z.enum(["automatic", "manual"]),
     acceptedPaymentMethods: z.array(z.enum(["CASH", "CARD", "WALLET"])).min(1).optional(),
    areaId: z.coerce.number({ message: "Area is required" }),
    lat: z.coerce.number({ message: "Clinic location (latitude) is required" }),
    lng: z.coerce.number({ message: "Clinic location (longitude) is required" }),
    schedule: z.record(z.object({ active: z.boolean(), from: z.string(), to: z.string() }), { message: "Weekly schedule is required" }),
    availabilityPeriod: z.enum(availabilityPeriodEnum, { message: "Booking availability period is required" }),
    availabilityFrom: z.string().optional().nullable(),
    availabilityTo: z.string().optional().nullable(),
    sessionsPerHour: z.coerce.number().int().min(1).max(12, { message: "Sessions per hour is required" }),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const { name: nameEnVal, nameAr: nameArVal, schedule: scheduleVal, ...rest } = parsed.data;
  const [clinic] = await db.insert(clinicsTable).values({
    doctorId: doc.id,
    nameEn: nameEnVal ?? "Clinic",
    name: nameArVal ?? null,
    schedule: scheduleVal !== undefined ? (scheduleVal ? JSON.stringify(scheduleVal) : null) : null,
    ...rest,
  }).returning();

  // Keep the doctor row's availability config in sync — the booking
  // calendar falls back to the doctor's own values when a clinic-level
  // value is absent, and other reads (e.g. doctor list) use the doctor row.
  if (rest.availabilityPeriod !== undefined || rest.availabilityFrom !== undefined
    || rest.availabilityTo !== undefined || rest.sessionsPerHour !== undefined) {
    await db.update(doctorsTable).set({
      ...(rest.availabilityPeriod !== undefined ? { availabilityPeriod: rest.availabilityPeriod ?? null } : {}),
      ...(rest.availabilityFrom !== undefined ? { availabilityFrom: rest.availabilityFrom ?? null } : {}),
      ...(rest.availabilityTo !== undefined ? { availabilityTo: rest.availabilityTo ?? null } : {}),
      ...(rest.sessionsPerHour !== undefined ? { sessionsPerHour: rest.sessionsPerHour ?? null } : {}),
    }).where(eq(doctorsTable.id, doc.id));
  }

  res.status(201).json({ ...clinic, name: clinic.nameEn, schedule: clinic.schedule ? JSON.parse(clinic.schedule) : null });
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
    name: z.string().min(1).optional().nullable(),
    nameAr: z.string().optional().nullable(),
    address: z.string().min(1, "Clinic address is required").optional(),
    mapUrl: z.string().optional().nullable(),
    phone: z.string().min(1, "Clinic phone number is required").optional(),
    fee: z.coerce.number().optional().nullable(),
    followUpDays: z.coerce.number().int().min(0).optional().nullable(),
    followUpPrice: z.coerce.number().int().min(0).optional().nullable(),
    bookingConfirmationMethod: z.enum(["automatic", "manual"]).optional(),
     acceptedPaymentMethods: z.array(z.enum(["CASH", "CARD", "WALLET"])).min(1).optional(),
    areaId: z.coerce.number({ message: "Area is required" }).optional(),
    lat: z.coerce.number({ message: "Clinic location (latitude) is required" }).optional(),
    lng: z.coerce.number({ message: "Clinic location (longitude) is required" }).optional(),
    schedule: z.record(z.object({ active: z.boolean(), from: z.string(), to: z.string() }), { message: "Weekly schedule is required" }).optional().nullable(),
    availabilityPeriod: z.enum(availabilityPeriodEnum, { message: "Booking availability period is required" }).optional().nullable(),
    availabilityFrom: z.string().optional().nullable(),
    availabilityTo: z.string().optional().nullable(),
    sessionsPerHour: z.coerce.number().int().min(1).max(12, { message: "Sessions per hour is required" }).optional().nullable(),
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }

  const { name: nameEnVal, nameAr: nameArVal, schedule: scheduleVal, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (nameEnVal !== undefined) updateData.nameEn = nameEnVal;
  if (nameArVal !== undefined) updateData.name = nameArVal;
  if (scheduleVal !== undefined) updateData.schedule = scheduleVal ? JSON.stringify(scheduleVal) : null;

  const [updated] = await db.update(clinicsTable)
    .set(updateData)
    .where(and(eq(clinicsTable.id, clinicId), eq(clinicsTable.doctorId, doc.id)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Clinic not found" }); return; }

  // Keep the doctor row's availability config in sync with the clinic's,
  // mirroring the medical-center affiliated-doctor sync behavior.
  if (rest.availabilityPeriod !== undefined || rest.availabilityFrom !== undefined
    || rest.availabilityTo !== undefined || rest.sessionsPerHour !== undefined) {
    await db.update(doctorsTable).set({
      ...(rest.availabilityPeriod !== undefined ? { availabilityPeriod: rest.availabilityPeriod ?? null } : {}),
      ...(rest.availabilityFrom !== undefined ? { availabilityFrom: rest.availabilityFrom ?? null } : {}),
      ...(rest.availabilityTo !== undefined ? { availabilityTo: rest.availabilityTo ?? null } : {}),
      ...(rest.sessionsPerHour !== undefined ? { sessionsPerHour: rest.sessionsPerHour ?? null } : {}),
    }).where(eq(doctorsTable.id, doc.id));
  }

  res.json({ ...updated, name: updated.nameEn, schedule: updated.schedule ? JSON.parse(updated.schedule) : null });
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

/* ─── POST /doctors/profile/submit-for-review ─── */
router.post("/doctors/profile/submit-for-review", async (req, res): Promise<void> => {
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

  const [row] = await db
    .select({ id: doctorsTable.id, accountStatus: doctorsTable.accountStatus, nameEn: doctorsTable.nameEn })
    .from(doctorsTable)
    .where(eq(doctorsTable.userId, payload.sub))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Doctor profile not found" });
    return;
  }
  if (row.accountStatus !== "incomplete") {
    res.status(400).json({ error: "Profile has already been submitted" });
    return;
  }

  await db.update(doctorsTable).set({ accountStatus: "pending", isSubmittedForReview: true }).where(eq(doctorsTable.id, row.id));

  db.insert(adminNotificationsTable).values({
    type: "new_doctor",
    title: "Doctor Submitted for Review",
    body: `Dr. ${row.nameEn} has completed their profile and submitted for admin review.`,
    userId: payload.sub,
  }).catch(() => {});

  req.log.info({ doctorId: row.id }, "Doctor submitted profile for review");
  res.json({ message: "Your profile has been submitted for review. You will be notified by email once approved." });
});

/* ─── Helper: verify JWT and return doctor row ─── */
async function requireDoctor(authHeader: string | undefined): Promise<
  { doctorRow: { id: number }; userId: number } | { error: string; status: number }
> {
  if (!authHeader?.startsWith("Bearer ")) return { error: "Unauthorized", status: 401 };
  let payload: { sub: number };
  try {
    payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
  const [doc] = await db.select({ id: doctorsTable.id }).from(doctorsTable)
    .where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doc) return { error: "Doctor not found", status: 403 };
  return { doctorRow: doc, userId: payload.sub };
}

/* ─── GET /doctors/assistants ─── */
router.get("/doctors/assistants", async (req, res): Promise<void> => {
  const result = await requireDoctor(req.headers.authorization);
  if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
  const { doctorRow } = result;

  const assistants = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    phone: usersTable.phone,
    email: usersTable.email,
    isActive: usersTable.isActive,
    assistantClinicId: usersTable.assistantClinicId,
    clinicNameEn: clinicsTable.nameEn,
    clinicName: clinicsTable.name,
    createdAt: usersTable.createdAt,
  }).from(usersTable)
    .leftJoin(clinicsTable, eq(usersTable.assistantClinicId, clinicsTable.id))
    .where(and(eq(usersTable.assistantDoctorId, doctorRow.id), eq(usersTable.role, "assistant" as const)));

  res.json(assistants);
});

/* ─── POST /doctors/assistants ─── */
router.post("/doctors/assistants", async (req, res): Promise<void> => {
  const result = await requireDoctor(req.headers.authorization);
  if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
  const { doctorRow } = result;

  const Schema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(7, "Valid phone required"),
    email: z.string().email().optional().nullable(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    clinicId: z.coerce.number({ required_error: "Clinic is required" }),
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const [clinic] = await db.select({ id: clinicsTable.id }).from(clinicsTable)
    .where(and(eq(clinicsTable.id, parsed.data.clinicId), eq(clinicsTable.doctorId, doctorRow.id))).limit(1);
  if (!clinic) {
    res.status(400).json({ error: "Clinic not found or does not belong to you" });
    return;
  }

  const [existing] = await db.select({ id: usersTable.id }).from(usersTable)
    .where(eq(usersTable.phone, parsed.data.phone)).limit(1);
  if (existing) {
    res.status(409).json({ error: "Mobile number already registered" });
    return;
  }

  const { default: bcryptLib } = await import("bcryptjs");
  const passwordHash = await bcryptLib.hash(parsed.data.password, 10);

  const [user] = await db.insert(usersTable).values({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email ?? null,
    passwordHash,
    role: "assistant" as const,
    assistantClinicId: parsed.data.clinicId,
    assistantDoctorId: doctorRow.id,
    isActive: true,
  }).returning();

  res.status(201).json({ id: user.id, name: user.name, phone: user.phone, isActive: user.isActive, assistantClinicId: user.assistantClinicId });
});

/* ─── PATCH /doctors/assistants/:id/toggle ─── */
router.patch("/doctors/assistants/:id/toggle", async (req, res): Promise<void> => {
  const result = await requireDoctor(req.headers.authorization);
  if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
  const { doctorRow } = result;

  const id = parseInt(req.params.id, 10);
  const [assistant] = await db.select({ id: usersTable.id, isActive: usersTable.isActive, assistantDoctorId: usersTable.assistantDoctorId })
    .from(usersTable).where(and(eq(usersTable.id, id), eq(usersTable.role, "assistant" as const))).limit(1);
  if (!assistant || assistant.assistantDoctorId !== doctorRow.id) {
    res.status(404).json({ error: "Assistant not found" });
    return;
  }

  const [updated] = await db.update(usersTable).set({ isActive: !assistant.isActive }).where(eq(usersTable.id, id)).returning({ isActive: usersTable.isActive });
  res.json({ isActive: updated.isActive });
});

/* ─── DELETE /doctors/assistants/:id ─── */
router.delete("/doctors/assistants/:id", async (req, res): Promise<void> => {
  const result = await requireDoctor(req.headers.authorization);
  if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
  const { doctorRow } = result;

  const id = parseInt(req.params.id, 10);
  const [assistant] = await db.select({ id: usersTable.id, assistantDoctorId: usersTable.assistantDoctorId })
    .from(usersTable).where(and(eq(usersTable.id, id), eq(usersTable.role, "assistant" as const))).limit(1);
  if (!assistant || assistant.assistantDoctorId !== doctorRow.id) {
    res.status(404).json({ error: "Assistant not found" });
    return;
  }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

/* ─── POST /doctors/:id/follow  (toggle follow/unfollow) ─── */
router.post("/doctors/:id/follow", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  let payload: { sub: number; role: string };
  try {
    payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number; role: string };
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const doctorId = parseInt(req.params.id, 10);
  if (isNaN(doctorId)) { res.status(400).json({ error: "Invalid doctor id" }); return; }

  const [doctor] = await db.select({ id: doctorsTable.id })
    .from(doctorsTable)
    .where(eq(doctorsTable.id, doctorId))
    .limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }

  const followerId = payload.sub;

  const [existing] = await db.select({ id: doctorFollowsTable.id })
    .from(doctorFollowsTable)
    .where(and(
      eq(doctorFollowsTable.followerId, followerId),
      eq(doctorFollowsTable.doctorId, doctorId),
    ))
    .limit(1);

  if (existing) {
    await db.delete(doctorFollowsTable).where(eq(doctorFollowsTable.id, existing.id));
    res.json({ following: false });
  } else {
    await db.insert(doctorFollowsTable).values({ followerId, doctorId });
    res.json({ following: true });
  }
});

/* ─── GET /stats ─── */
router.get("/stats", async (req, res): Promise<void> => {
  const [clinicsRow] = await db.select({ clinicsCount: count() }).from(clinicsTable);
  const cityRows = await db
    .selectDistinct({ cityId: areasTable.cityId })
    .from(clinicsTable)
    .innerJoin(areasTable, eq(clinicsTable.areaId, areasTable.id))
    .where(sql`${areasTable.cityId} is not null`);
  res.json({
    clinicsCount: clinicsRow?.clinicsCount ?? 0,
    citiesWithClinics: cityRows.length,
  });
});

export default router;
