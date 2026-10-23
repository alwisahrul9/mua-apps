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
  event.waitUntil(
    (async () => {
      try {
        const data = event.data!.json() as {
          title?: string;
          body?: string;
          message?: string;
          icon?: string;
          tag?: string;
          url?: string;
          bookingId?: string;
          booking_id?: string;
        };
        const bookingId = data.bookingId ?? data.booking_id;

        // The backend already sends each payload to a subscription owned by
        // the authenticated user. Do not depend on a browser session here:
        // push events must also work while the app is closed or the session
        // endpoint is temporarily unavailable.
        await self.registration.showNotification(
          data.title || "Notifikasi JadiCantik",
          {
            body: data.body || data.message || "Ada aktivitas terbaru.",
            icon: data.icon || "/icon.png",
            badge: "/icon.png",
            tag: data.tag,
            data: {
              url: data.url ||
                (bookingId
                  ? `/dashboard/bookings/${bookingId}`
                  : "/dashboard/bookings"),
              bookingId,
            },
          },
        );

        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        for (const client of clients) {
          client.postMessage({ type: "booking-notification", bookingId });
        }
      } catch (error) {
        console.error("Unable to display push notification", error);
      }
    })(),
  );
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
