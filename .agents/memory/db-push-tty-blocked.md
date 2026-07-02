---
name: drizzle-kit push blocked by unrelated interactive prompt
description: What to do when `pnpm --filter @workspace/db run push` hangs/fails on an unrelated table's interactive prompt.
---

`drizzle-kit push` can prompt interactively (e.g. "is this a rename?" for an unrelated unique constraint like `vouchers_code_unique`) even when your schema change is unrelated and additive. In a non-TTY agent shell this blocks or fails the whole push, even for simple additive changes like a new nullable/array column.

**Why:** drizzle-kit diffs the entire schema on every push, so pending ambiguous changes anywhere in the schema block your unrelated change from applying, and there's no non-interactive flag to skip just the ambiguous ones.

**How to apply:** For a simple additive column (nullable column, new array column, etc.) that isn't part of the ambiguous diff, apply it directly with raw SQL instead of blocking on the whole push, e.g.:
`psql "$DATABASE_URL" -c "ALTER TABLE <table> ADD COLUMN IF NOT EXISTS <col> <type>;"`
Then keep the corresponding Drizzle schema definition in the TS source so future `push` runs see the DB and schema in sync for that column. Still flag the pre-existing ambiguous prompt to the user/task owner since it will keep blocking full `push` runs until resolved.
