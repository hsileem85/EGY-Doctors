import { Router } from "express";
import { z } from "zod/v4";
import { sendContactEmail } from "../lib/email";

const router = Router();

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
