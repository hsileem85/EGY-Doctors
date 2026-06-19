import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, inArray } from "drizzle-orm";
import crypto from "crypto";
import { z } from "zod";
import { db, usersTable, doctorsTable, passwordResetTokensTable, adminNotificationsTable } from "@workspace/db";
import { sendDoctorPendingEmail, sendPasswordResetEmail } from "../lib/email.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";

function signToken(userId: number, role: string): string {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: "7d" } as jwt.SignOptions);
}

/** Generate all common phone format variants so lookups work regardless of
 *  how the number was stored (with/without country code, with/without leading 0).
 *  e.g. "+201070200998" → ["01070200998","1070200998","201070200998","+201070200998"]
 */
function phoneVariants(phone: string): string[] {
  const digits = phone.replace(/\D/g, ""); // strip everything non-numeric
  // Strip Egypt country code (20) if present
  const local = digits.startsWith("20") && digits.length > 10
    ? digits.slice(2)
    : digits;
  // Egyptian local numbers always start with 0 (e.g. 01070200998)
  const withZero    = local.startsWith("0") ? local : "0" + local;
  const withoutZero = local.startsWith("0") ? local.slice(1) : local;
  return Array.from(new Set([
    withZero,               // 01070200998
    withoutZero,            // 1070200998
    "20" + withoutZero,     // 201070200998
    "+20" + withoutZero,    // +201070200998
    digits,                 // raw digits as entered
    "+" + digits,           // +digits
  ]));
}

const router: IRouter = Router();

/* ─── POST /auth/signup ─── */
router.post("/auth/signup", async (req, res): Promise<void> => {
  const Schema = z.object({
    name: z.string().min(1, "Name is required"),
    nameAr: z.string().optional().nullable(),
    phone: z.string().min(7, "Valid phone required"),
    email: z.string().email().optional().nullable(),
    nationalId: z.string().optional().nullable(),
    syndicateNumber: z.string().optional().nullable(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["patient", "doctor", "medical_center"]),
    specialtyId: z.coerce.number().optional().nullable(),
    cityId: z.coerce.number().optional().nullable(),
    experience: z.coerce.number().optional().nullable(),
    license: z.string().optional().nullable(),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const d = parsed.data;

  const existing = await db.select({ id: usersTable.id }).from(usersTable)
    .where(eq(usersTable.phone, d.phone)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Phone number already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(d.password, 10);

  const [user] = await db.insert(usersTable).values({
    name: d.name,
    nameAr: d.nameAr ?? null,
    phone: d.phone,
    email: d.email ?? null,
    nationalId: d.nationalId ?? null,
    syndicateNumber: d.syndicateNumber ?? null,
    passwordHash,
    role: d.role,
  }).returning();

  let doctorId: number | null = null;
  let accountStatus: string | null = null;
  if (d.role === "doctor") {
    const [doc] = await db.insert(doctorsTable).values({
      userId: user.id,
      nameEn: d.name,
      name: d.nameAr ?? null,
      specialtyId: d.specialtyId ?? null,
      cityId: d.cityId ?? null,
      license: d.license ?? null,
      experience: d.experience ?? null,
    }).returning();
    doctorId = doc.id;
    accountStatus = doc.accountStatus;

    if (user.email) {
      sendDoctorPendingEmail(user.email, user.name).catch(() => {});
    }
  }

  const roleLabels: Record<string, { type: "new_patient" | "new_doctor" | "new_medical_center"; titleEn: string; bodyEn: string }> = {
    patient: { type: "new_patient", titleEn: "New Patient Registered", bodyEn: `${d.name} joined as a patient.` },
    doctor: { type: "new_doctor", titleEn: "New Doctor Registered", bodyEn: `${d.name} applied as a doctor and is pending review.` },
    medical_center: { type: "new_medical_center", titleEn: "New Medical Center Registered", bodyEn: `${d.name} registered as a medical center.` },
  };
  const label = roleLabels[d.role];
  if (label) {
    db.insert(adminNotificationsTable).values({
      type: label.type,
      title: label.titleEn,
      body: label.bodyEn,
      userId: user.id,
    }).catch(() => {});
  }

  const token = signToken(user.id, user.role);
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      nameAr: user.nameAr ?? null,
      phone: user.phone,
      email: user.email ?? null,
      role: user.role,
      doctorId,
      accountStatus,
    },
  });
});

/* ─── POST /auth/signin ─── */
router.post("/auth/signin", async (req, res): Promise<void> => {
  const Schema = z.object({
    phone: z.string().min(1),
    password: z.string().min(1),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Phone and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable)
    .where(inArray(usersTable.phone, phoneVariants(parsed.data.phone))).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid phone number or password" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid phone number or password" });
    return;
  }

  let doctorId: number | null = null;
  let accountStatus: string | null = null;
  if (user.role === "doctor") {
    const [doc] = await db.select({ id: doctorsTable.id, accountStatus: doctorsTable.accountStatus })
      .from(doctorsTable)
      .where(eq(doctorsTable.userId, user.id)).limit(1);
    if (doc) {
      doctorId = doc.id;
      accountStatus = doc.accountStatus;
    }
  }

  const token = signToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      nameAr: user.nameAr ?? null,
      phone: user.phone,
      email: user.email,
      role: user.role,
      doctorId,
      accountStatus,
    },
  });
});

/* ─── GET /auth/me ─── */
router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let payload: { sub: number; role: string };
  try {
    payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number; role: string };
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.sub)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  let doctorId: number | null = null;
  let accountStatus: string | null = null;
  let image: string | null = null;
  if (user.role === "doctor") {
    const [doc] = await db.select({ id: doctorsTable.id, accountStatus: doctorsTable.accountStatus, image: doctorsTable.image })
      .from(doctorsTable)
      .where(eq(doctorsTable.userId, user.id)).limit(1);
    if (doc) {
      doctorId = doc.id;
      accountStatus = doc.accountStatus;
      image = doc.image ?? null;
    }
  }

  res.json({
    id: user.id,
    name: user.name,
    nameAr: user.nameAr ?? null,
    phone: user.phone,
    email: user.email,
    role: user.role,
    doctorId,
    accountStatus,
    image,
  });
});

/* ─── POST /auth/forgot-password ─── */
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const Schema = z.object({ phone: z.string().min(1) });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }

  const [user] = await db.select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(inArray(usersTable.phone, phoneVariants(parsed.data.phone))).limit(1);

  if (!user) {
    res.status(404).json({ error: "No account found with this phone number." });
    return;
  }

  if (!user.email) {
    res.status(400).json({ error: "No email address on file for this account. Please contact support." });
    return;
  }

  const token = crypto.randomBytes(3).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.insert(passwordResetTokensTable).values({ userId: user.id, token, expiresAt });

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (emailErr) {
    req.log.error({ err: emailErr }, "Failed to send password reset email");
    res.status(500).json({ error: "Failed to send the reset email. Please try again in a moment." });
    return;
  }

  req.log.info({ userId: user.id, email: user.email }, "Password reset email sent");

  // Mask the email for display: j***@gmail.com
  const [local, domain] = user.email.split("@");
  const maskedEmail = `${local.slice(0, 1)}***@${domain}`;

  res.json({ message: "Reset code sent to your email.", maskedEmail });
});

/* ─── POST /auth/reset-password ─── */
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const Schema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const [record] = await db.select().from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.token, parsed.data.token)).limit(1);

  if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired reset code" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, record.userId));
  await db.update(passwordResetTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokensTable.id, record.id));

  res.json({ message: "Password reset successfully" });
});

export default router;
