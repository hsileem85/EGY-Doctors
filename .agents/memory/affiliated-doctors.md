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
