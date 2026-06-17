---
name: API server build gotchas
description: Sharp edges for esbuild bundling and useQuery typing in this project.
---

## zod must be in api-server dependencies
- `zod` is used directly in `src/routes/auth.ts`, `doctors.ts`, `listings.ts`, `appointments.ts`
- It must be listed in `artifacts/api-server/package.json` `dependencies` (not just workspace root)
- Missing `zod` causes esbuild to fail with "Could not resolve zod"

## getDoctors() in useQuery
- `getDoctors` has an optional params signature: `(params?) => Promise<ApiDoctor[]>`
- Passing it directly as `queryFn: getDoctors` causes TS2769 because QueryFunctionContext ≠ params shape
- Always wrap: `queryFn: () => getDoctors()` and add explicit generic `useQuery<ApiDoctor[]>({...})`

## API routes mount path
- Routes are defined at paths like `/specialties`, `/doctors` inside their routers
- `app.ts` mounts the root router at `/api` → full paths become `/api/specialties`, `/api/doctors`
- The server must be REBUILT after adding new route files (restart the workflow)

**Why:** These caused 404s and TS errors that were non-obvious without knowing the build step is required.
