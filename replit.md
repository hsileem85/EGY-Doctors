# EGY Doctors

A bilingual (EN/AR) medical directory platform for Egypt where patients can search, compare, and book appointments with top-rated doctors — and where doctors can register, build their profile, manage their schedule, and publish health content.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — Drizzle table definitions (source of truth for DB)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, doctors, listings, appointments, admin)
- `artifacts/egy-doctors/src/lib/api.ts` — typed frontend API client (all API calls go through here)
- `artifacts/egy-doctors/src/context/AuthContext.tsx` — JWT auth state, signIn/signUp/signOut
- `scripts/src/seed.ts` — DB seed script (`pnpm --filter @workspace/scripts run seed`)

## Architecture decisions

- **JWT in localStorage** (`egy_token`), sent as `Authorization: Bearer` header. Phone is the primary login identifier.
- **Contract-first API**: OpenAPI spec + Orval codegen in `lib/api-spec`. Run `pnpm --filter @workspace/api-spec run codegen` after spec changes.
- **SignUpData** uses `specialtyId: number` (not `specialty: string`). Doctors set specialty via Profile Setup after signing up.
- **API server** must be **rebuilt** (workflow restart) after adding new route files — esbuild bundles everything at startup.
- **`getDoctors()` in useQuery**: always wrap in arrow fn `() => getDoctors()` and use explicit generic `useQuery<ApiDoctor[]>` to avoid TS2769.

## Product

- Patients: Search doctors by name/specialty/city, view profiles with clinic map links and reviews, book appointments with date/time picker.
- Doctors: Sign up, complete profile setup (specialty, bio, fee, clinics, schedule), manage appointments from dashboard.
- Auth: Sign in / sign up (patient / doctor / medical center), forgot password / reset via token.
- Admin: Manage doctor applications and platform data.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Admin credentials

- **Phone:** `01000000000`  
- **Password:** `admin123`  
- Login at `/admin` — the page has its own login gate (not behind ProtectedRoute)

## Gotchas

- `zod` must be in `artifacts/api-server/package.json` dependencies (not just root) — esbuild won't find it otherwise.
- Always restart the API server workflow after adding new route files to trigger a rebuild.
- `pnpm --filter @workspace/db run push` applies schema changes to the dev DB (never run in production).
- Seed users all use password `password123`. Seed is idempotent (safe to re-run).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
