---
name: Appointment privacy boundary
description: Why public booking availability must stay separate from patient appointment details.
---

Keep anonymous booking availability separate from authorized appointment detail access. Query filters narrow access; they never establish ownership. Phone matching is not proof of patient identity.

**Why:** The public booking page needs occupied times, but must not receive the patient records used by provider dashboards. Reusing the private list for that page either discloses patient information or breaks anonymous booking when access checks are tightened.

**How to apply:** When changing booking or dashboard queries, preserve a slots-only public response and derive private access from the authenticated account and current provider/assistant assignments.

Automatic task reconciliation can silently damage route bodies and generated declaration order even when it reports only a notes conflict.

**Why:** A reconciliation duplicated and misplaced Express handlers and moved a generated Zod reference ahead of its declaration after the pre-merge checks had passed.

**How to apply:** After reconciliation, compare sensitive route diffs with incoming main and regenerate API outputs if their ordering changed. Pre-merge verification does not establish post-merge correctness.