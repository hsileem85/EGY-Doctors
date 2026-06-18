---
name: Bilingual schema migration lessons
description: How the bilingual column strategy works in EGY Doctors and pitfalls to avoid
---

## Strategy

- **doctors/clinics**: `name_en` = English, `name` (original column) = Arabic; `bio_en` = English, `bio` = Arabic
- **lookup tables (specialties, cities, areas, users)**: keep `name` as English (original), add `name_ar` as separate column for Arabic
- DO NOT create `name_ar` on doctors/clinics — their original `name`/`bio` columns play the Arabic role

## API contract (unchanged externally)
- JSON response still exposes `name`/`bio` (= `name_en`/`bio_en`) + `nameAr`/`bioAr` (= `name`/`bio` columns)
- Routes map: `nameAr: doctorsTable.name`, `bioAr: doctorsTable.bio`, `nameAr: clinicsTable.name`

## Drizzle gotcha
- `drizzle-kit push` requires a TTY for column-rename confirmation — use raw SQL (`ALTER TABLE ... RENAME COLUMN`) instead, then push-force to sync metadata
- When multiple joined tables have a column with the same name (e.g., `doctors.name`, `specialties.name`, `cities.name`), Drizzle v0.45 does NOT auto-alias in SQL — this causes query failures. Fix: use explicit `.as()` or `sql<T>`` template aliases for conflicting columns.

## Orphaned columns to watch
- The bilingual migration accidentally left `name_en` on `specialties`, `cities`, `areas`, and `users` (with NOT NULL constraint on specialties) — these must be dropped
- The `name_ar` column on `specialties`, `cities`, `areas`, `users` was never created by the migration — must be added manually before seeding

**Why:** `drizzle-kit push` in non-TTY mode silently fails on column renames; the migration SQL only partially ran.

## Seeding
- Seed uses `on conflict do nothing` — if lookup tables already exist, Arabic names won't be updated. Patch with direct SQL UPDATE statements after adding `name_ar` columns.
