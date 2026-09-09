"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    });
    return { data: notifications, error: null };
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return { data: [], error: error.message };
  }
}

export async function getUnreadNotificationsCount() {
  try {
    const count = await prisma.notification.count({
      where: {
        isRead: false,
      },
    });
    return { count, error: null };
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return { count: 0, error: error.message };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: error.message };
  }
}
