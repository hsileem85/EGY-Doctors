---
name: EGY Doctors stack decisions
description: Auth token storage, SignUpData field names, forgotPassword response shape.
---

## Auth token
- Stored in `localStorage` under key `egy_token`
- Sent as `Authorization: Bearer <token>` header
- Phone is the primary login identifier (not email)

## SignUpData (api.ts)
- Field is `specialtyId?: number` — NOT `specialty: string`
- When signing up as a doctor, specialty is NOT passed at signup; doctor sets it in Profile Setup (`/profile-setup`)

## forgotPassword response
- Returns `{ message: string; resetToken?: string }` — the field is `resetToken`, NOT `token`

## Role-based redirect after auth
- `patient` → `/patient/dashboard`
- `doctor` (new signup) → `/profile-setup`; (returning) → `/dashboard`
- `medical_center` (new) → `/medical-center/profile-setup`; (returning) → `/medical-center/dashboard`

## AuthContext
- Exposes: `{ user, token, isLoading, signIn(phone, pw), signUp(data), signOut }`
- `signIn` / `signUp` both return `{ user: AuthUser, token: string }`
- AuthUser: `{ id, phone, name, role, doctorId? }`

**Why:** These names are easy to get wrong (specialty vs specialtyId, token vs resetToken) and caused TS errors.
