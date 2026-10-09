/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;
  event.waitUntil((async () => {
    try {
      const data = event.data!.json() as { title: string; body: string; userId: string; icon?: string; tag?: string; url?: string; bookingId?: string };
      const response = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) return;
      const session = await response.json() as { user?: { id?: string } };
      if (!session.user?.id || session.user.id !== data.userId) return;
      await self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/icon.png",
        badge: "/icon.png",
        tag: data.tag,
        data: { url: data.url || "/dashboard/bookings", bookingId: data.bookingId },
      });
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) client.postMessage({ type: "booking-notification", bookingId: data.bookingId });
    } catch {
      // Ignore malformed payloads or unavailable login sessions.
    }
  })());
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/dashboard/bookings", self.location.origin);
  if (target.origin !== self.location.origin) return;
  const urlToOpen = target.href;
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const matchingClient = windowClients.find((client) => client.url === urlToOpen);

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
