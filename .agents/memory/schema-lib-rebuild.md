---
name: New schema tables need lib rebuild
description: After adding tables to lib/db/src/schema/, artifacts get TS2305/TS2724 until lib is rebuilt.
---

When new tables are added to `lib/db/src/schema/` and exported via `lib/db/src/schema/index.ts`, the `@workspace/db` lib declarations are stale until rebuilt.

**Rule:** Always run `pnpm run typecheck:libs` before running `pnpm --filter @workspace/api-server run typecheck` (or any leaf artifact typecheck) after schema additions.

**Why:** The lib is composite — it must emit declarations for leaf packages to consume. The leaf artifact's `tsc --noEmit` reads the emitted `.d.ts` files, not the source `.ts` files directly.

**How to apply:** Any time you add/rename/remove a schema table export, run `pnpm run typecheck:libs` first, then typecheck the artifact.
