---
name: Affiliated Doctors Pattern
description: How medical centers own and manage doctor records; system-user creation; search visibility rules.
---

## Rule
Medical centers create "affiliated doctors" via `POST /medical-centers/affiliated-doctors`. Each doctor gets a real `doctors` row linked back via `affiliatedCenterId` (nullable integer FK → `medical_centers.id`, ON DELETE SET NULL).

## System user creation
A synthetic `users` row is created alongside each affiliated doctor:
- `phone` = `sys_${centerId}_${crypto.randomBytes(4).hex}` (guaranteed unique, can never be dialled)
- `passwordHash` = `bcrypt.hash(randomBytes(32).hex, 10)` — valid hash, but input is unrecorded so the account can never be logged into
- `role` = `"doctor"`

On delete, both `doctors` and `users` rows are removed.

## Search visibility
`GET /doctors` subscription filter was extended:
```sql
affiliated_center_id IS NOT NULL
OR subscription_status = 'TRIAL'
OR (subscription_status = 'ACTIVE' AND ...)
```
Affiliated doctors always appear regardless of subscription status.

## Schedule storage
`doctors.schedule` is a nullable `text` column storing JSON:
```json
{ "SAT": { "from": "09:00", "to": "17:00" }, "MON": { "from": "09:00", "to": "17:00" } }
```
Only days with `enabled: true` in the frontend form are written; absent keys mean "day off".

**Why:** Keeps the doctor table as the single source of truth without a separate schedule join table, and avoids touching the existing doctor/patient workflow.

## Clinic sync on create/update/delete
Creating an affiliated doctor also inserts a real `clinics` row (nameEn/address/phone/lat/lng copied from the center, fee from the doctor form) so the doctor's public profile shows a real clinic instead of falling back to a "virtual clinic" placeholder. Updating the doctor's name/fee syncs the linked clinic; deleting the doctor also deletes its linked clinic row first.

## Two unrelated "clinic" concepts — don't conflate
`clinics` (per-doctor, real bookable location) is a completely different table from `center_clinics` (a poly-clinic center's internal specialty-clinic list, used only for an independent doctor's "polyClinic" badge). A dashboard feature that manages `center_clinics` CRUD is unrelated to affiliated-doctor clinic creation — removing one does not affect the other.

## Public directory endpoint
`GET /medical-centers/directory` (public, read-only) returns approved centers joined with city name plus aggregated affiliated-doctor names/specialties/count — used to list registered centers on the Home page.

## Two separate doctor-card implementations must be updated together
The doctor listing UI has two independent card components rendering doctor summaries: `components/DoctorCard.tsx` (Search page) and an inline compact card inside `pages/Home.tsx` (homepage featured-doctors section). Both read the same `ApiDoctor.polyClinic`/`ApiDoctor.affiliatedCenter` fields but each has its own hand-rolled JSX/styling.

**Why:** `DoctorCard.tsx` already showed a poly-clinic/medical-center affiliation badge, but the Home.tsx compact card did not, so a doctor's homepage card silently looked like a private/independent clinic even though Search correctly disclosed the affiliation.

**How to apply:** Any visual/informational change to doctor cards (badges, pricing, contact info, etc.) must be applied to both `DoctorCard.tsx` and the compact card in `Home.tsx` — grep for the field name across `pages/Home.tsx` and `components/DoctorCard.tsx` before considering the change complete.
