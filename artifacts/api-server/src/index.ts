import app from "./app";
import { logger } from "./lib/logger";
import { db, specialtiesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const SPECIALTIES = [
  { id: 1,  name: "Cardiology",       nameAr: "أمراض القلب" },
  { id: 3,  name: "Dermatology",      nameAr: "الأمراض الجلدية" },
  { id: 4,  name: "Orthopedics",      nameAr: "جراحة العظام" },
  { id: 8,  name: "Neurology",        nameAr: "طب الأعصاب" },
  { id: 9,  name: "Pediatrics",       nameAr: "طب الأطفال" },
  { id: 10, name: "Gynecology",       nameAr: "أمراض النساء والتوليد" },
  { id: 11, name: "Ophthalmology",    nameAr: "طب وجراحة العيون" },
  { id: 12, name: "ENT",              nameAr: "الأنف والأذن والحنجرة" },
  { id: 13, name: "Psychiatry",       nameAr: "الطب النفسي" },
  { id: 14, name: "Urology",          nameAr: "المسالك البولية" },
  { id: 15, name: "Gastroenterology", nameAr: "أمراض الجهاز الهضمي" },
  { id: 16, name: "Radiology",        nameAr: "الأشعة التشخيصية" },
  { id: 17, name: "Oncology",         nameAr: "الأورام" },
  { id: 18, name: "Endocrinology",    nameAr: "الغدد الصماء" },
  { id: 19, name: "General Medicine", nameAr: "الطب العام" },
  { id: 20, name: "Dentistry",        nameAr: "طب الأسنان" },
];

async function seedSpecialties() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(specialtiesTable);

    if (count >= SPECIALTIES.length) {
      logger.info({ count }, "Specialties already seeded — skipping");
      return;
    }

    // Null out specialty references before clearing stale rows
    await db.execute(sql`UPDATE doctors SET specialty_id = NULL WHERE specialty_id NOT IN (${sql.join(SPECIALTIES.map(s => sql`${s.id}`), sql`, `)})`);
    await db.execute(sql`DELETE FROM specialties WHERE id NOT IN (${sql.join(SPECIALTIES.map(s => sql`${s.id}`), sql`, `)})`);

    for (const s of SPECIALTIES) {
      await db.execute(
        sql`INSERT INTO specialties (id, name, name_ar) VALUES (${s.id}, ${s.name}, ${s.nameAr})
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, name_ar = EXCLUDED.name_ar`
      );
    }

    // Remap any doctor whose specialty was nulled — restore to ENT (id=12) as safe default
    await db.execute(sql`UPDATE doctors SET specialty_id = 12 WHERE specialty_id IS NULL`);

    logger.info({ inserted: SPECIALTIES.length }, "Specialties seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed specialties — server will still start");
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await seedSpecialties();
});
