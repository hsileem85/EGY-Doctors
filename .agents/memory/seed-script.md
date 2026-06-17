---
name: Seed script
description: How to seed the EGY Doctors database with initial data.
---

## Location
`scripts/src/seed.ts` — run with:
```
pnpm --filter @workspace/scripts run seed
```

## What it seeds
- 16 specialties (Cardiology, Dermatology, Orthopedics, etc.)
- 8 cities (Cairo, Alexandria, Giza, Mansoura, Assiut, Tanta, Zagazig, Port Said)
- 15 areas (Maadi, Heliopolis, Nasr City, Zamalek, Downtown Cairo, New Cairo, 6th October, Smouha, Stanley, Roushdy, Gleem, Dokki, Mohandessin, Agouza, Haram)
- 12 sample doctors with realistic bios, ratings, clinics, and reviews
- All seed users use password: `password123`

## Idempotent
- Uses `onConflictDoNothing()` so it's safe to run multiple times
- If a user already exists (phone conflict), that doctor is skipped with a warning

## Dependencies
- `@workspace/db` and `bcryptjs` must be in `scripts/package.json` dependencies
- `tsx` is the runner (devDependency)

**Why:** Needed to populate lookup tables (specialties, cities) and sample doctors so the UI has real data to display.
