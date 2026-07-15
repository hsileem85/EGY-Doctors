import { useEffect } from "react";
import { getVapidPublicKey, savePushSubscription } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buf = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return view;
}

export function usePushNotifications() {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    let cancelled = false;

    async function register() {
      try {
        /* Register service worker */
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        /* Ask permission */
        const permission = await Notification.requestPermission();
        if (permission !== "granted" || cancelled) return;

        /* Fetch VAPID public key */
        const { publicKey } = await getVapidPublicKey();
        if (!publicKey || cancelled) return;

        /* Subscribe */
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        if (cancelled) return;

        const json = sub.toJSON() as {
          endpoint: string;
          keys?: { p256dh?: string; auth?: string };
        };

        if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
          await savePushSubscription({
            endpoint: json.endpoint,
            keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          });
        }
      } catch (err) {
        console.warn("Push registration failed:", err);
      }
    }

    register();
    return () => { cancelled = true; };
  }, [user?.id, token]);
}
