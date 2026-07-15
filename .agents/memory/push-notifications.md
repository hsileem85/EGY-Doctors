---
name: Push notifications setup
description: How push notifications are set up in EGY Doctors — web-push, VAPID keys, service worker.
---

## Package
`web-push` (+ `@types/web-push`) installed in `@workspace/api-server`.

## VAPID Keys
Stored as shared env vars (not secrets):
- `VAPID_PUBLIC_KEY` — safe to expose to client
- `VAPID_PRIVATE_KEY` — server-only, do not log

Endpoint `GET /api/push/vapid-public-key` returns the public key to clients.

**Why env vars, not secrets:** Keys are auto-generated (not user-provided), so the "always requestEnvVar" rule for user-provided secrets doesn't apply. They were set via `setEnvVars` in shared environment.

## Service Worker
`artifacts/egy-doctors/public/sw.js` — handles `push` and `notificationclick` events. Registered in `usePushNotifications` hook.

## Architecture
- `notifyFollowers()` helper in `notifications.ts` — bulk-inserts in-app rows + sends web push.
- Called from `magazine.ts` fire-and-forget after post insert.
- Expired subscriptions (HTTP 410) auto-deleted on send failure.

## Key files
- Backend: `artifacts/api-server/src/routes/notifications.ts`
- Hook: `artifacts/egy-doctors/src/hooks/usePushNotifications.ts`
- Bell: `artifacts/egy-doctors/src/components/layout/NotificationBell.tsx`
