---
name: Stripe booking payments
description: Financial-integrity rules for Stripe appointment checkout and reconciliation.
---
Appointment online payments use Stripe Checkout; cash-at-clinic bookings never create a paid payment or escrow entry. Only authenticated active patients may book, and patient identity, clinic ownership, fee, and enabled methods are server-controlled.

**Why:** Checkout can succeed when the return redirect is lost, and ambiguous API responses can occur after Stripe creates a session. Treating cash as paid or creating a second session on retry can mint internal funds or expose patients to duplicate charges.

**How to apply:** Persist an attempt reference before Stripe calls, replay the exact Checkout request with the same idempotency key after ambiguous failures, bind and validate the session, and reconcile paid/cancelled/completed states idempotently. Stripe booking does not spend wallet cashback; review-gated cashback remains separate.