import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  db, magazinePostsTable, doctorsTable, specialtiesTable, usersTable,
} from "@workspace/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const router: IRouter = Router();

function makeImage(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=D4A853&size=200`;
}

interface JwtPayload { sub: number; role: string }

function decodeJwt(authHeader: string | undefined): JwtPayload | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as JwtPayload;
  } catch {
    return null;
  }
}

async function getDoctorRowByUserId(userId: number) {
  const [row] = await db.select({ id: doctorsTable.id })
    .from(doctorsTable)
    .where(eq(doctorsTable.userId, userId))
    .limit(1);
  return row ?? null;
}

/* shared helper — fetch posts joined with doctor/specialty/user */
async function fetchPosts(filters: { doctorId?: number; type?: string }) {
  const query = db
    .select({
      id: magazinePostsTable.id,
      doctorId: magazinePostsTable.doctorId,
      type: magazinePostsTable.type,
      title: magazinePostsTable.title,
      content: magazinePostsTable.content,
      mediaUrl: magazinePostsTable.mediaUrl,
      createdAt: magazinePostsTable.createdAt,
      doctorNameEn: doctorsTable.nameEn,
      doctorNameAr: doctorsTable.name,
      doctorImage: doctorsTable.image,
      specialtyName: specialtiesTable.name,
      specialtyNameAr: specialtiesTable.nameAr,
    })
    .from(magazinePostsTable)
    .leftJoin(doctorsTable, eq(magazinePostsTable.doctorId, doctorsTable.id))
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id))
    .leftJoin(usersTable, eq(doctorsTable.userId, usersTable.id));

  const conditions = [];
  if (filters.doctorId !== undefined) {
    conditions.push(eq(magazinePostsTable.doctorId, filters.doctorId));
  }
  if (filters.type && ["article", "tip", "video"].includes(filters.type)) {
    conditions.push(eq(magazinePostsTable.type, filters.type as "article" | "tip" | "video"));
  }

  const rows = conditions.length > 0
    ? await query.where(conditions.length === 1 ? conditions[0] : and(...conditions)).orderBy(desc(magazinePostsTable.createdAt))
    : await query.orderBy(desc(magazinePostsTable.createdAt));

  return rows.map(r => ({
    id: r.id,
    doctorId: r.doctorId,
    type: r.type,
    title: r.title ?? null,
    content: r.content ?? null,
    mediaUrl: r.mediaUrl ?? null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    doctorName: r.doctorNameEn ?? "Unknown",
    doctorNameAr: r.doctorNameAr ?? null,
    doctorImage: r.doctorImage ?? makeImage(r.doctorNameEn ?? "Doctor"),
    specialty: r.specialtyName ?? "",
    specialtyAr: r.specialtyNameAr ?? "",
  }));
}

/* ─── GET /magazine/posts ─── */
router.get("/magazine/posts", async (req, res): Promise<void> => {
  const typeFilter = typeof req.query.type === "string" ? req.query.type : undefined;
  const doctorIdRaw = typeof req.query.doctorId === "string" ? parseInt(req.query.doctorId, 10) : undefined;
  const doctorId = doctorIdRaw && !isNaN(doctorIdRaw) ? doctorIdRaw : undefined;
  const posts = await fetchPosts({ type: typeFilter, doctorId });
  res.json(posts);
});

/* ─── GET /magazine/posts/mine ─── */
router.get("/magazine/posts/mine", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") {
    res.status(401).json({ error: "Doctor authentication required" });
    return;
  }
  const doctor = await getDoctorRowByUserId(payload.sub);
  if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }
  const posts = await fetchPosts({ doctorId: doctor.id });
  res.json(posts);
});

/* ─── POST /magazine/posts ─── */
const createPostSchema = z.object({
  type: z.enum(["article", "tip", "video"]),
  title: z.string().max(500).optional().nullable(),
  content: z.string().max(10000).optional().nullable(),
  mediaUrl: z.string().url().max(2000).optional().nullable(),
});

router.post("/magazine/posts", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") {
    res.status(403).json({ error: "Only doctors can publish content." });
    return;
  }
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const { type, title, content, mediaUrl } = parsed.data;

  if (type === "video" && !mediaUrl) {
    res.status(422).json({ error: "mediaUrl is required for video posts." });
    return;
  }
  if ((type === "article" || type === "tip") && !content) {
    res.status(422).json({ error: "content is required for article and tip posts." });
    return;
  }

  const doctor = await getDoctorRowByUserId(payload.sub);
  if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }

  const [inserted] = await db.insert(magazinePostsTable).values({
    doctorId: doctor.id,
    type,
    title: title ?? null,
    content: content ?? null,
    mediaUrl: mediaUrl ?? null,
  }).returning({ id: magazinePostsTable.id });

  res.status(201).json({ id: inserted.id });
});

/* ─── DELETE /magazine/posts/:id ─── */
router.delete("/magazine/posts/:id", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") {
    res.status(403).json({ error: "Only doctors can delete their content." });
    return;
  }
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid post id" }); return; }

  const doctor = await getDoctorRowByUserId(payload.sub);
  if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }

  const [post] = await db.select({ doctorId: magazinePostsTable.doctorId })
    .from(magazinePostsTable)
    .where(eq(magazinePostsTable.id, postId))
    .limit(1);

  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  if (post.doctorId !== doctor.id) {
    res.status(403).json({ error: "You can only delete your own posts." });
    return;
  }

  await db.delete(magazinePostsTable).where(eq(magazinePostsTable.id, postId));
  res.json({ ok: true });
});

export default router;
