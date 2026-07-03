---
name: Duplicate legacy workflows can conflict on ports
description: Symptom and fix when two workflows target the same artifact/port and one fails with EADDRINUSE.
---

Some sessions carry old workflow entries (e.g. plain "API Server" / "EGY Doctors") alongside the canonical `artifacts/<slug>: <service>` workflows created by the artifacts system. Both bind the same `PORT`, so restarting the canonical one can fail with "Port already in use" while the stale duplicate is still running.

**Why:** workflow config drift — legacy workflow names predate the artifacts-based naming convention and were never cleaned up, so two workflow entries point at the same underlying service/port.

**How to apply:** if a restart fails with a port-in-use error, run `listWorkflows()` to spot duplicates targeting the same port/command, `removeWorkflow` the stale/legacy-named one (not the `artifacts/...` one), then restart the canonical workflow.
