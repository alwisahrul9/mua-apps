"use server";

import { prisma } from "@/lib/prisma";
import * as webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_MAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function subscribeUser(sub: any) {
  console.log("Subscription payload:", sub);
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;

  if (!p256dh || !auth) {
    throw new Error("Invalid subscription keys");
  }

  // Save to DB
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: {
      p256dh,
      auth,
    },
    create: {
      endpoint: sub.endpoint,
      p256dh,
      auth,
    },
  });

  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  try {
    await prisma.pushSubscription.delete({
      where: { endpoint },
    });
    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

export async function sendPushNotification(title: string, body: string, url: string = "/dashboard/notifications") {
  try {
    const subscriptions = await prisma.pushSubscription.findMany();

    const payload = JSON.stringify({
      title,
      body,
      url,
    });

    const notifications = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          },
          payload
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        } else {
          console.error("Error sending push to endpoint", sub.endpoint, error);
        }
      }
    });

    await Promise.all(notifications);
    return { success: true };
  } catch (error) {
    console.error("Error broadcasting push notification:", error);
    return { success: false, error: "Failed to send notifications" };
  }
}
