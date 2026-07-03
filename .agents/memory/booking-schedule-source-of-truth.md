---
name: Booking schedule source of truth
description: Where doctor/clinic availability lives, day-key convention, and why the backend—not the frontend—must be the enforcement point for bookable slots.
---

## Rule
The booking calendar must never generate slots client-side. Available days/times come only from persisted schedule data:
- Independent doctors: `clinics.schedule` (per-clinic, nullable text/JSON).
- Medical-center-affiliated doctors (no own clinics, `selectedClinic.id <= 0` "virtual clinic" sentinel): `doctors.schedule` (top-level, nullable text/JSON).
If neither is configured, show an empty state — never fall back to a fabricated schedule.

**Why:** A prior implementation hardcoded a 14-day mock schedule in the frontend, so the calendar looked populated even when no doctor/clinic had configured any availability, and bookings could be made for times the doctor never offered.

## Day-key convention
`["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]` indexed by `Date.getDay()` (frontend, local time) / `getUTCDay()` (backend, `dateStr + "T00:00:00Z"`). Clinic schedule shape: `Record<Day,{active,from,to}>`. Doctor-level (affiliated) shape: `Record<Day,{from,to}>` — no `active` key means enabled; treat `active === false` as the only "disabled" signal so one validator works for both shapes.

## Enforcement must be server-side too
`POST /appointments` validates against the same schedule JSON (parses `clinics.schedule` or `doctors.schedule` depending on whether `clinicId` is present) and rejects both out-of-schedule times and double-bookings (same doctor+clinic+date+time, status != cancelled) before insert. Relying on the frontend alone to only show valid slots is not sufficient — direct API calls could bypass it.

## How to apply
When adding any new booking/availability-adjacent feature, always read schedule from these two columns (never regenerate it), and mirror the day-key/time-parsing logic between frontend display and backend validation so they never disagree about what's bookable.

## Day-key casing must be normalized, not just "consistent"
The Medical Center dashboard's "Edit Doctor" schedule form (`MedicalCenterDashboard.tsx` `AffiliatedDoctorsTab`) independently defined its own `DAYS` array and originally used all-uppercase keys (`SAT`,`SUN`,`MON`...), while every other schedule consumer (booking calendar, `POST /appointments` validator) used capitalized 3-letter keys (`Sat`,`Sun`,`Mon`...). Because JS object key lookup is case-sensitive, a doctor with a fully configured schedule showed "No availability configured yet" on the public booking page — the data existed but the wrong-case key silently missed the lookup, with `if (!window) return false;`/`continue` swallowing the mismatch instead of erroring.

**Why:** Multiple independent UI surfaces (own-clinic schedule editor, affiliated-doctor schedule editor, public booking calendar, backend validator) each read/write the same `schedule` JSON column but were authored separately, so casing drifted. Case-sensitive key lookups fail silently (`undefined`) rather than throwing, so this kind of bug ships invisibly and only surfaces as "the doctor says it's set up but patients can't book."

**How to apply:** Any time you touch a `schedule` read site (frontend or backend), route it through a `normalizeScheduleKeys` helper that maps `key.slice(0,3)` case-insensitively to the canonical `Sun/Mon/Tue/Wed/Thu/Fri/Sat` before indexing — done at the API layer (`doctors.ts`, `medical_centers.ts`, `appointments.ts`) and defensively again in the frontend consumers (`DoctorProfile.tsx`, `MedicalCenterDashboard.tsx`) so historical DB rows saved with any casing keep working without a data migration.

## `availabilityPeriod`/`sessionsPerHour` must be synced to BOTH `clinics` and `doctors` rows, on both self-service and affiliated paths
The booking calendar (`DoctorProfile.tsx`) prioritizes clinic-level `availabilityPeriod`/`sessionsPerHour` but falls back to the doctor-level columns when a clinic doesn't have them set (and other reads, like doctor list views, read the doctor row directly). `medical_centers.ts` (affiliated-doctor PUT) already synced both tables, but the independent-doctor self-service routes (`POST /doctor/clinics`, `PUT /doctor/clinics/:id` in `doctors.ts`) originally wrote only to `clinicsTable`, silently leaving `doctors.availability_period`/`doctors.sessions_per_hour` null forever.

**Why:** Any endpoint that lets a doctor/clinic set one of these config pairs has two "write sites" (clinic row + doctor row) because two different read sites exist. It's easy to add the field to one insert/update path and forget the mirrored table, and nothing errors — the column just stays null.

**How to apply:** When adding or touching an availability-config field, grep for every insert/update to `clinicsTable`/`doctorsTable` involving that field (`doctors.ts` self-service routes and `medical_centers.ts` affiliated routes) and confirm both tables are written in the same request when the field is present in the payload.
