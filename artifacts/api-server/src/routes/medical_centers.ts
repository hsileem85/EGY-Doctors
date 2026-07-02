import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import {
  db, medicalCentersTable, centerClinicsTable, usersTable,
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
  subType: z.enum(["POLY_CLINIC", "HOSPITAL", "LAB", "SCAN_CENTER"]).optional().nullable(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  bioAr: z.string().optional(),
  commercialRegistrationNumber: z.string().optional(),
  image: z.string().optional(),
});

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

export default router;
