import { getToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }

  return buffer;
}

export async function enableNotifications(): Promise<void> {
    if (!("Notification" in window)) {
        throw new Error ("Notificaitons are not supported by this browser.");
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push notifications are not supported by this browser.");
    }

    if(!VAPID_PUBLIC_KEY){
        throw new Error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
    }

    const token = getToken();

    if(!token) {
        throw new Error("You must be logged in first.");
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error("Notification permission was not granted.");
    }

    await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
    });

    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if(!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
        });
    }

    const response = await fetch(`${API_URL}/notifications/subscribe`,{
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription.toJSON()),
    });

    if (!response.ok){
        throw new Error("Failed to save push subscription.")
    }
}