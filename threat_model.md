# Threat Model

## Project Overview

EGY Doctors is a public-facing medical directory and appointment platform for Egypt. A React frontend calls a Node.js/Express API backed by PostgreSQL via Drizzle ORM. Patients can search for doctors and book appointments; doctors can manage profiles, clinics, assistants, appointments, and magazine content; admins can approve doctors and manage platform data. Production traffic is TLS-terminated by the platform, and the deployed app is publicly reachable.

## Assets

- **User accounts and sessions** — patient, doctor, assistant, medical center, and admin identities, password hashes, JWTs, password-reset codes, and preference settings. Compromise enables impersonation and unauthorized access to medical and business workflows.
- **Patient and appointment data** — patient names, phone numbers, appointment dates/times, visit history, notes, and follow-up status. This is sensitive personal and healthcare-adjacent data.
- **Doctor onboarding and business data** — doctor approval status, clinic details, assistants, listings, and magazine content. Unauthorized changes can disrupt operations or publish fraudulent content.
- **Platform configuration and secrets** — JWT signing secret, database connection string, and outbound email capability. Compromise can enable token forgery, data tampering, or abuse of notification flows.
- **Administrative workflows** — doctor approvals, user search, password resets, notifications, and site settings. These operations are security-sensitive because they can change account state and access.

## Trust Boundaries

- **Browser to API** — all frontend input is untrusted. The API must validate, authenticate, and authorize every sensitive request.
- **API to PostgreSQL** — the API has broad database access. Any broken auth or injection at the API layer can expose or modify the full dataset.
- **Public to authenticated boundary** — doctor search, public profiles, contact, and some content are intentionally public; profile management, preferences, appointments, assistants, and patient data are not.
- **Authenticated to admin boundary** — admin operations must be enforced server-side and never rely on frontend gating.
- **API to external email service** — password reset and contact delivery depend on an outbound connector. Failure handling must not reduce identity assurance.
- **Production vs dev-only boundary** — `artifacts/mockup-sandbox/**` is treated as dev-only and out of production scope unless production reachability is demonstrated.

## Scan Anchors

- Production API entry point: `artifacts/api-server/src/app.ts` and `artifacts/api-server/src/routes/*.ts`
- Auth/token logic: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/routes/doctors.ts`, `artifacts/api-server/src/routes/magazine.ts`, `artifacts/egy-doctors/src/context/AuthContext.tsx`
- Highest-risk business surfaces: `artifacts/api-server/src/routes/admin.ts`, `artifacts/api-server/src/routes/appointments.ts`, doctor self-service routes in `artifacts/api-server/src/routes/doctors.ts`
- Public/authenticated/admin split: public search and contact routes in `doctors.ts`, `listings.ts`, `contact.ts`; authenticated self-service in `auth.ts`, `doctors.ts`, `magazine.ts`; admin in `admin.ts`
- Usually out of scope: `artifacts/mockup-sandbox/**`, local build artifacts, and dev-only scripts unless a production code path reaches them

## Threat Categories

### Spoofing

This application uses bearer JWTs stored in the browser and sent to the API. The system must ensure that only secrets controlled outside source code can sign tokens, and every protected route must verify a valid token before trusting user identity. Password-reset flows must not let an attacker obtain reset material merely by knowing a phone number or by triggering delivery failures.

### Tampering

Patients, doctors, assistants, and admins can all trigger state changes: bookings, profile edits, approvals, password resets, and clinic updates. The server must derive authority from the authenticated caller rather than from request parameters such as `patientUserId`, `doctorId`, or guessed resource IDs. Administrative mutations must be server-authorized before changing data.

### Information Disclosure

The platform stores sensitive contact and appointment information. API responses must return only the records the caller is entitled to see, and public endpoints must not leak internal/admin data, phone-based account existence, or reset credentials. Logs and error handling must avoid exposing tokens and other secrets.

### Denial of Service

Public endpoints such as sign-in, password reset, contact, review submission, and appointment booking can be exercised by anonymous users. These flows should be resilient to brute force and spam so attackers cannot cheaply exhaust email delivery, create excessive records, or disrupt staff workflows.

### Elevation of Privilege

The core risk in this system is crossing from anonymous or low-privilege access into doctor, assistant, or admin powers. Admin routes, appointment state changes, patient directories, and assistant-management endpoints must enforce server-side role and ownership checks. Frontend-only gating, hardcoded credentials, or predictable signing secrets must never be relied on as security controls.
