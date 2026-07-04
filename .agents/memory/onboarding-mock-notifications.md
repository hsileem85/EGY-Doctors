---
name: Doctor onboarding mock notifications & OTP gate
description: How the EGY Doctors doctor registration → review → approval journey simulates external notifications and gates account creation.
---

# Doctor onboarding: mock notifications & OTP gate

The doctor onboarding journey deliberately **simulates** external comms rather than sending them, because there is no live WhatsApp/SMS provider. These are product requirements, not placeholders to "finish later".

- **WhatsApp OTP gate (registration):** doctor sign-up must NOT create the account on the details step. It sends a mock OTP (static dev code `1234`), then requires OTP entry; `apiSignUp` runs only after the correct code.
  - **Why:** the required user journey mandates verification before account creation.
- **Mock notifications are log lines with an exact prefix/format** the product spec pins down:
  - Admin email on submit-for-review: `[EMAIL SENT to admin@egydoctors.com] Subject: New Doctor Profile Pending Review - {name}` (server log via `req.log.info`).
  - Doctor WhatsApp on admin approve/reject: `[WHATSAPP SENT to {phone}] ...`; the **approval** text is exact and must include the "log in and subscribe to a billing plan" sentence verbatim.
  - **How to apply:** treat these strings as contract — don't paraphrase. Server logs use `req.log.info` (never `console.log`) even for these mocks.
- **"Ready for Review" gate:** a doctor profile is submittable only when biography is filled AND `clinics.length > 0`. Keep the dashboard gate and profile-setup validation in sync with this rule.

## Signup failure must not report success
A signup `catch` block must never blanket-set the success state. If `apiSignUp` throws (e.g. duplicate phone/email), stay on the current step and surface an error — otherwise the user sees "registered" and proceeds with no account.
**Why:** the OTP finalize step originally had `catch { setIsSuccess(true) }`, which falsely advanced failed registrations to profile setup.
