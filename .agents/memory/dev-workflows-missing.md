---
name: EGY Doctors dev workflows sometimes missing
description: What to do when no dev workflows exist for egy-doctors/api-server artifacts in this environment
---

Some sessions start with no workflows configured at all (`.replit` only has test/CI workflows, no dev server). Check each artifact's `.replit-artifact/artifact.toml` for the intended `localPort`/`PORT`/`BASE_PATH` and recreate matching workflows via `configureWorkflow`:

- API Server: `PORT=8080 pnpm --filter @workspace/api-server run dev`, waitForPort 8080, outputType "console".
- EGY Doctors frontend: `PORT=20495 BASE_PATH=/ pnpm --filter @workspace/egy-doctors run dev`, waitForPort 20495, outputType "webview".

**Why:** the api-server's `dev` script throws `PORT environment variable is required` if launched without it — `configureWorkflow`'s `command` string must inline the env vars (no separate env param), matching the ports/paths declared in `artifact.toml`.

**How to apply:** if `restart_workflow` fails with `RUN_COMMAND_NOT_FOUND`, don't assume the app is broken — check whether the workflow exists at all first, then recreate it from the artifact.toml values above before debugging app code.
