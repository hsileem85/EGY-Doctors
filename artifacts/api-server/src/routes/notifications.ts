import { Router, type IRouter } from "express";
import webpush from "web-push";
import jwt from "jsonwebtoken";
import { eq, desc, and, inArray } from "drizzle-orm";
import {
  db, notificationsTable, pushSubscriptionsTable, doctorFollowsTable, usersTable,
} from "@workspace/db";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";

const router: IRouter = Router();

interface JwtPayload { sub: number; role: string }

function decodeJwt(authHeader: string | undefined): JwtPayload | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as JwtPayload;
  } catch { return null; }
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:notifications@egy-doctors.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );
} else {
  logger.warn("VAPID keys not configured — push notifications disabled");
}

/* ─── GET /notifications ─── */
router.get("/notifications", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload) { res.status(401).json({ error: "Unauthorized" }); return; }

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, payload.sub))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(rows);
});

/* ─── GET /notifications/unread-count ─── */
router.get("/notifications/unread-count", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload) { res.status(401).json({ error: "Unauthorized" }); return; }

  const rows = await db
    .select({ id: notificationsTable.id })
    .from(notificationsTable)
    .where(and(
      eq(notificationsTable.userId, payload.sub),
      eq(notificationsTable.isRead, false),
    ));

  res.json({ count: rows.length });
});

/* ─── PATCH /notifications/read-all ─── (must come before /:id/read) */
router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload) { res.status(401).json({ error: "Unauthorized" }); return; }

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, payload.sub));

  res.json({ ok: true });
});

/* ─── PATCH /notifications/:id/read ─── */
router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(
      eq(notificationsTable.id, id),
      eq(notificationsTable.userId, payload.sub),
    ));

  res.json({ ok: true });
});

/* ─── GET /push/vapid-public-key ─── */
router.get("/push/vapid-public-key", (_req, res): void => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

/* ─── POST /push/subscribe ─── */
router.post("/push/subscribe", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { endpoint, keys } = req.body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: "endpoint, keys.p256dh, and keys.auth are required" });
    return;
  }

  await db
    .insert(pushSubscriptionsTable)
    .values({ userId: payload.sub, endpoint, p256dh: keys.p256dh, auth: keys.auth })
    .onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: { userId: payload.sub, p256dh: keys.p256dh, auth: keys.auth },
    });

  res.status(201).json({ ok: true });
});

/* ─── DELETE /push/subscribe ─── */
router.delete("/push/subscribe", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { endpoint } = req.body ?? {};
  if (!endpoint) { res.status(400).json({ error: "endpoint is required" }); return; }

  await db
    .delete(pushSubscriptionsTable)
    .where(and(
      eq(pushSubscriptionsTable.endpoint, endpoint),
      eq(pushSubscriptionsTable.userId, payload.sub),
    ));

  res.json({ ok: true });
});

/* ──────────────────────────────────────────────────────────
   Exported helper — called from magazine.ts after post insert
   ────────────────────────────────────────────────────────── */
export async function notifyFollowers(params: {
  doctorId: number;
  doctorNameEn: string;
  postId: number;
  postTitle?: string | null;
  postType: string;
}): Promise<void> {
  const { doctorId, doctorNameEn, postId, postTitle, postType } = params;

  try {
    const followers = await db
      .select({
        userId: doctorFollowsTable.followerId,
        notificationLanguage: usersTable.notificationLanguage,
      })
      .from(doctorFollowsTable)
      .innerJoin(usersTable, eq(doctorFollowsTable.followerId, usersTable.id))
      .where(eq(doctorFollowsTable.doctorId, doctorId));

    if (!followers.length) return;

    const typeLabel: Record<string, { en: string; ar: string }> = {
      article: { en: "Article", ar: "مقال" },
      tip:     { en: "Tip",     ar: "نصيحة" },
      video:   { en: "Video",   ar: "فيديو" },
    };
    const tl = typeLabel[postType] ?? { en: "Post", ar: "منشور" };

    /* ── 1. In-app notifications (bulk insert) ── */
    const notifRows = followers.map(f => {
      const isAr = ((f.notificationLanguage as "en" | "ar") ?? "ar") === "ar";
      return {
        userId: f.userId,
        type: "new_post" as const,
        title: isAr
          ? `${tl.ar} جديد من د. ${doctorNameEn}`
          : `New ${tl.en} from Dr. ${doctorNameEn}`,
        body: postTitle ?? (isAr ? "نشر الطبيب محتوى جديداً" : "The doctor published new content"),
        data: { postId, doctorId, postType },
      };
    });

    await db.insert(notificationsTable).values(notifRows);
    logger.info({ postId, count: notifRows.length }, "In-app notifications inserted");

    /* ── 2. Push notifications ── */
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

    const followerIds = followers.map(f => f.userId);
    const subs = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(inArray(pushSubscriptionsTable.userId, followerIds));

    if (!subs.length) return;

    const langMap = new Map<number, "en" | "ar">(
      followers.map(f => [f.userId, (f.notificationLanguage as "en" | "ar") ?? "ar"]),
    );

    let pushSent = 0, pushFailed = 0;
    for (const sub of subs) {
      const isAr = (langMap.get(sub.userId) ?? "ar") === "ar";
      const pushPayload = JSON.stringify({
        title: isAr
          ? `${tl.ar} جديد من د. ${doctorNameEn}`
          : `New ${tl.en} from Dr. ${doctorNameEn}`,
        body: postTitle ?? (isAr ? "محتوى جديد" : "New content"),
        url: `/magazine/${postId}`,
        icon: "/favicon.svg",
      });
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload,
        );
        pushSent++;
      } catch (err: unknown) {
        pushFailed++;
        /* 410 Gone = subscription expired; clean it up */
        if (
          err && typeof err === "object" && "statusCode" in err &&
          (err as { statusCode: number }).statusCode === 410
        ) {
          await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.id, sub.id));
        }
        logger.warn({ err, subId: sub.id }, "Push send failed");
      }
    }
    logger.info({ postId, pushSent, pushFailed }, "Push notifications complete");
  } catch (err) {
    logger.error({ err, doctorId, postId }, "notifyFollowers error");
  }
}

/** Delivers a single user's notification through both durable in-app and Web Push channels. */
export async function notifyUser(userId: number, input: {
  type?: "new_post" | "appointment_reminder";
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(notificationsTable).values({
    userId, type: input.type ?? "new_post", title: input.title, body: input.body, data: input.data ?? {},
  });
  await sendPushToUser(userId, input);
}

/** Best-effort Web Push delivery for a notification already stored in-app. */
export async function sendPushToUser(userId: number, input: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;
  const subs = await db.select().from(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.userId, userId));
  for (const sub of subs) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify({
        title: input.title, body: input.body, url: "/patient/dashboard", icon: "/favicon.svg", data: input.data,
      }));
    } catch (err: unknown) {
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.id, sub.id));
      }
      logger.warn({ err, subId: sub.id }, "Appointment push notification failed");
    }
  }
}

export default router;
