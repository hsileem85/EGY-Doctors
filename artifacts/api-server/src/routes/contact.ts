import { Router } from "express";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import { sendContactEmail } from "../lib/email";

const router = Router();

const CONTACT_DEFAULTS: Record<string, string> = {
  contact_phone:       "+20 2 1234 5678",
  contact_phone_sub_en:"Available Sun–Thu",
  contact_phone_sub_ar:"متاح من الأحد إلى الخميس",
  contact_email:       "support@egydoctors.com",
  contact_address_en:  "15 Teseen St, New Cairo, Cairo",
  contact_address_ar:  "١٥ شارع التسعين، التجمع الخامس، القاهرة",
  contact_hours_en:    "9:00 AM – 6:00 PM",
  contact_hours_ar:    "٩:٠٠ ص – ٦:٠٠ م",
  contact_days_en:     "Sunday – Thursday",
  contact_days_ar:     "الأحد – الخميس",
  contact_whatsapp:    "201234567890",
};

/* ─── GET /settings/contact — public ─── */
router.get("/settings/contact", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteSettingsTable);

  const map: Record<string, string> = { ...CONTACT_DEFAULTS };
  for (const row of rows) {
    if (row.key in CONTACT_DEFAULTS) map[row.key] = row.value;
  }

  res.json({
    phone:       map["contact_phone"],
    phoneSubEn:  map["contact_phone_sub_en"],
    phoneSubAr:  map["contact_phone_sub_ar"],
    email:       map["contact_email"],
    address:     map["contact_address_en"],
    addressAr:   map["contact_address_ar"],
    hoursEn:     map["contact_hours_en"],
    hoursAr:     map["contact_hours_ar"],
    daysEn:      map["contact_days_en"],
    daysAr:      map["contact_days_ar"],
    whatsapp:    map["contact_whatsapp"],
  });
});

/* ─── POST /contact ─── */
router.post("/contact", async (req, res): Promise<void> => {
  const Schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required"),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    await sendContactEmail({ name, email, phone, subject, message });
    req.log.info({ from: email }, "Contact form message sent");
    res.json({ message: "Message sent successfully." });
  } catch (err) {
    req.log.error({ err }, "Failed to send contact form email");
    res.status(500).json({ error: "Failed to send your message. Please try again." });
  }
});

export default router;
