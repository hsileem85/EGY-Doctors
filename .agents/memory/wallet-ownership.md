---
name: Wallet ownership identity
description: Stable polymorphic ownership rules for EGY Doctors wallets.
---

Use the authenticated user ID as the stable wallet `ownerId` for patient, doctor, and medical-center accounts. A medical center's `ownerType` follows its selected subtype, while its `ownerId` remains unchanged. The platform wallet is the exception and uses `SYSTEM_REVENUE`. Assistant accounts do not own independent wallets.

**Why:** Doctor records use separate IDs and medical-center profiles can be created after signup. Using the authentication subject prevents re-keying or duplicating wallets when those related records are created later.

**How to apply:** Provision the wallet in the same transaction as signup. When a medical-center subtype changes, update only the wallet owner type. Resolve wallet access from the authenticated user rather than accepting owner identity from a client request.