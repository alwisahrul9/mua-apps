export function configuredVapidPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim().replace(/=+$/, "");
  if (!key) throw new Error("VAPID public key belum dikonfigurasi.");
  return key;
}

export function vapidKeyBytes(key: string): Uint8Array<ArrayBuffer> {
  const normalized = key.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized + "=".repeat((4 - (normalized.length % 4)) % 4));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  if (bytes.length !== 65 || bytes[0] !== 4) throw new Error("Format VAPID public key tidak valid.");
  return bytes;
}

export function subscriptionVapidPublicKey(subscription: PushSubscription): string | null {
  const key = subscription.options.applicationServerKey;
  if (!key) return null;
  let raw = "";
  for (const byte of new Uint8Array(key)) raw += String.fromCharCode(byte);
  return window.btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function isCurrentPushSubscription(subscription: PushSubscription): boolean {
  return subscriptionVapidPublicKey(subscription) === configuredVapidPublicKey();
}

export async function activePushRegistration(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/", updateViaCache: "none",
  });
  if (registration.active) return registration;
  const worker = registration.installing ?? registration.waiting;
  if (!worker) {
    if (registration.active) return registration;
    throw new Error("Service worker belum siap. Muat ulang halaman lalu coba lagi.");
  }
  await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      worker.removeEventListener("statechange", check);
      if (error) reject(error); else resolve();
    };
    const check = () => {
      if (worker.state === "activated") finish();
      else if (worker.state === "redundant") finish(new Error("Aktivasi service worker gagal."));
    };
    const timeout = setTimeout(() => finish(new Error("Service worker belum aktif. Muat ulang halaman lalu coba lagi.")), 15000);
    worker.addEventListener("statechange", check);
    check();
  });
  return registration;
}
