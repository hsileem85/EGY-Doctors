import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db, appointmentReminderDeliveriesTable, appointmentsTable, notificationsTable, usersTable, doctorsTable } from "@workspace/db";
import { sendPushToUser } from "../routes/notifications";

function appointmentInstant(date: string, value: string): Date | null {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = Number(m[1]); const minute = Number(m[2]);
  if (m[3]) { if (hour === 12) hour = 0; if (m[3].toUpperCase() === "PM") hour += 12; }
  if (hour > 23 || minute > 59) return null;
  const [year, month, day] = date.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const rough = new Date(target + (hour * 60 + minute) * 60000);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(rough);
  const get = (n: string) => Number(parts.find((p) => p.type === n)?.value);
  const displayed = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return new Date(rough.getTime() + (target + (hour * 60 + minute) * 60000 - displayed));
}

export async function processAppointmentReminders(): Promise<void> {
  const now = new Date();
  const candidates = await db.select({
    id: appointmentsTable.id, patientUserId: appointmentsTable.patientUserId,
    appointmentDate: appointmentsTable.appointmentDate, appointmentTime: appointmentsTable.appointmentTime,
    doctorName: usersTable.name,
  }).from(appointmentsTable)
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .leftJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
    .where(and(eq(appointmentsTable.status, "confirmed"), gte(appointmentsTable.appointmentDate, sql`CURRENT_DATE`), lte(appointmentsTable.appointmentDate, sql`CURRENT_DATE + 2`)));
  for (const row of candidates) {
    if (!row.patientUserId) continue;
    const at = appointmentInstant(String(row.appointmentDate), row.appointmentTime);
    if (!at) continue;
    const diff = at.getTime() - now.getTime();
    const kind = diff <= 3600000 && diff > 0 ? "1h" : diff <= 24 * 3600000 && diff > 3600000 ? "24h" : null;
    if (!kind) continue;
    const title = "Appointment reminder";
    const body = `${row.doctorName ?? "Your doctor"} appointment is in ${kind === "24h" ? "24 hours" : "1 hour"}.`;
    const data = { appointmentId: row.id, kind };
    const claimed = await db.transaction(async (tx) => {
      const [delivery] = await tx.insert(appointmentReminderDeliveriesTable)
        .values({ appointmentId: row.id, kind })
        .onConflictDoNothing({ target: [appointmentReminderDeliveriesTable.appointmentId, appointmentReminderDeliveriesTable.kind] })
        .returning();
      if (!delivery) return false;
      await tx.insert(notificationsTable).values({
        userId: row.patientUserId!,
        type: "appointment_reminder",
        title,
        body,
        data,
      });
      return true;
    });
    if (!claimed) continue;
    await sendPushToUser(row.patientUserId, { title, body, data });
  }
}