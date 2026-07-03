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
