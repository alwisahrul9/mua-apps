import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: any;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

self.addEventListener("push", (event: any) => {
  if (event.data) {
    const data = event.data.json();
    const options: any = {
      body: data.body,
      icon: data.icon || "https://nmntjgnmnzaekithicay.supabase.co/storage/v1/object/public/portfolios/images/icon.png",
      badge: "https://nmntjgnmnzaekithicay.supabase.co/storage/v1/object/public/portfolios/images/icon.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: data.url || "/",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients: any[]) => {
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
