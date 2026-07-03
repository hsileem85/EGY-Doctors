---
name: Orval codegen breaks with js-yaml v5
description: OpenAPI codegen (orval) fails to import js-yaml when the workspace override allows v5.
---

`pnpm --filter @workspace/api-spec run codegen` (orval) can fail because js-yaml v5 changed its module shape in a way orval's CJS default-import usage doesn't handle.

**Why:** orval bundles a CJS `require('js-yaml').default`-style import that assumes js-yaml v4's export shape; v5 breaks that.

**How to apply:** keep any `pnpm-workspace.yaml` dependency override for `js-yaml` pinned to `'>=4.2.0 <5'`. If codegen suddenly fails with a js-yaml related import error, check for a stray override/bump to v5 first before debugging the spec itself.
