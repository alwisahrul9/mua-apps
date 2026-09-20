"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { subscribeUser, unsubscribeUser } from "../notifications/push-actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service worker registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function subscribeToPush() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if an existing subscription exists and unsubscribe it first to avoid 
      // "Registration failed - push service error" when VAPID keys have changed.
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.trim();

      const applicationServerKey = urlBase64ToUint8Array(vapidKey);

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      setSubscription(sub);

      const subJson = JSON.parse(JSON.stringify(sub));
      await subscribeUser(subJson);

    } catch (error) {
      console.log("Failed to subscribe to push notifications", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await unsubscribeUser(sub.endpoint);
        setSubscription(null);
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return null; // Don't show anything if push isn't supported
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (subscription) {
    return (
      <button
        onClick={unsubscribeFromPush}
        className="flex items-center justify-center p-2 rounded-xl text-primary-dark hover:bg-primary-dark/10 transition-colors"
        title="Matikan Notifikasi Web"
      >
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={subscribeToPush}
      className="flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-primary-dark/10 hover:text-primary-dark transition-colors"
      title="Aktifkan Notifikasi Web"
    >
      <BellOff className="w-5 h-5" />
    </button>
  );
}
