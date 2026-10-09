"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { subscribeUser, unsubscribeUser } from "../notifications/push-actions";
import { toast } from "@/components/ui/toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager({
  showLabel = false,
}: {
  showLabel?: boolean;
}) {
  const router = useRouter();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    queueMicrotask(() => {
      if (!cancelled) setIsSupported(supported);
    });

    if (!supported) {
      queueMicrotask(() => {
        if (!cancelled) setIsLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .then((registration) =>
        Promise.race([
          registration.pushManager.getSubscription(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
        ]),
      )
      .then(async (sub) => {
        if (cancelled) return;
        if (sub) {
          const result = await subscribeUser(sub.toJSON());
          if (!result.success) {
            toast.add({ title: "Aktifkan kembali notifikasi", description: result.error, type: "error", timeout: 6000 });
            setSubscription(null);
            return;
          }
        }
        if (!cancelled) setSubscription(sub);
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const receivePush = (event: MessageEvent) => {
      if (event.data?.type !== "booking-notification") return;
      window.dispatchEvent(new Event("booking-notification"));
      router.refresh();
    };
    navigator.serviceWorker.addEventListener("message", receivePush);
    return () => navigator.serviceWorker.removeEventListener("message", receivePush);
  }, [router]);

  async function subscribeToPush() {
    setIsLoading(true);
    try {
      // Use register instead of .ready to prevent hanging if SW isn't active
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      // Check if an existing subscription exists and unsubscribe it first to avoid
      // "Registration failed - push service error" when VAPID keys have changed.
      const existingSub = await Promise.race([
        registration.pushManager.getSubscription(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
      ]);
      if (existingSub) {
        const cleanupResult = await unsubscribeUser(
          (existingSub as PushSubscription).endpoint,
        );
        if (!cleanupResult.success) throw new Error(cleanupResult.error);
        await (existingSub as PushSubscription).unsubscribe();
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.trim();

      const applicationServerKey = urlBase64ToUint8Array(vapidKey);

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      setSubscription(sub);

      const subJson = JSON.parse(JSON.stringify(sub));
      const result = await subscribeUser(subJson);
      if (!result.success) throw new Error(result.error);
      toast.add({
        title: "Berhasil",
        description: "Notifikasi berhasil diaktifkan.",
        type: "success",
        timeout: 5000,
      });
    } catch (error) {
      console.log("Failed to subscribe to push notifications", error);
      toast.add({
        title: "Gagal mengaktifkan notifikasi",
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
        type: "error",
        timeout: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await Promise.race([
        registration.pushManager.getSubscription(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
      ]);
      if (sub) {
        const result = await unsubscribeUser(
          (sub as PushSubscription).endpoint,
        );
        if (!result.success) throw new Error(result.error);
        await (sub as PushSubscription).unsubscribe();
        setSubscription(null);
        toast.add({
          title: "Berhasil",
          description: "Notifikasi berhasil dinonaktifkan.",
          type: "success",
          timeout: 5000,
        });
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications", error);
      toast.add({
        title: "Gagal menonaktifkan notifikasi",
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
        type: "error",
        timeout: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return showLabel ? (
      <span className="text-sm text-muted-foreground">
        Tidak didukung pada browser ini
      </span>
    ) : null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        {showLabel && <span>Memeriksa izin...</span>}
      </div>
    );
  }

  if (subscription) {
    return (
      <button
        onClick={unsubscribeFromPush}
        className="flex items-center justify-center gap-2 rounded-xl border border-input px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted dark:text-primary-dark dark:hover:bg-muted-dark"
        title="Matikan Notifikasi Web"
      >
        <Bell className="w-5 h-5" />
        {showLabel && <span>Nonaktifkan Notifikasi</span>}
      </button>
    );
  }

  return (
    <button
      onClick={subscribeToPush}
      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 dark:bg-primary-dark dark:text-primary-foreground-dark dark:hover:bg-primary-dark/90"
      title="Aktifkan Notifikasi Web"
    >
      <BellOff className="w-5 h-5" />
      {showLabel && <span>Aktifkan Notifikasi</span>}
    </button>
  );
}
