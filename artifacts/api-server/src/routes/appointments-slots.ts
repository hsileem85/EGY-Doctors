import { Router, type IRouter } from "express";
import { and, eq, ne } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import {
  GetAppointmentSlotsQueryParams,
  GetAppointmentSlotsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * Public appointment availability projection.
 *
 * This endpoint intentionally returns only date/time values. Appointment
 * details remain behind the authenticated GET /appointments endpoint.
 */
router.get("/appointments/slots", async (req, res): Promise<void> => {
  const parsed = GetAppointmentSlotsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid appointment filters" });
    return;
  }

  const { doctorId, clinicId } = parsed.data;
  if (
    !Number.isSafeInteger(doctorId)
    || (clinicId !== undefined && !Number.isSafeInteger(clinicId))
  ) {
    res.status(400).json({ error: "Invalid appointment filters" });
    return;
  }
  const conditions = [
    eq(appointmentsTable.doctorId, doctorId),
    ne(appointmentsTable.status, "cancelled"),
  ];
  if (clinicId !== undefined) {
    conditions.push(eq(appointmentsTable.clinicId, clinicId));
  }

  const rows = await db
    .select({
      appointmentDate: appointmentsTable.appointmentDate,
      appointmentTime: appointmentsTable.appointmentTime,
    })
    .from(appointmentsTable)
    .where(and(...conditions));

  res.json(GetAppointmentSlotsResponse.parse(rows));
});

export default router;