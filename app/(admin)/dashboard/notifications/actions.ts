"use server"

import { revalidatePath } from "next/cache"
import { apiErrorMessage } from "@/lib/api/client"
import { listNotifications } from "@/lib/api/dashboard"
import { serverApi } from "@/lib/api/server"
import { invalidateCurrentNotificationCache } from "@/lib/notification-cache"

export async function getNotifications(forceRefresh = false) {
  try {
    if (forceRefresh) await invalidateCurrentNotificationCache()
    return { data: await listNotifications(), error: null }
  } catch (error) {
    return { data: [], error: apiErrorMessage(error) }
  }
}

export async function getUnreadNotificationsCount() {
  try {
    const notifications = await listNotifications()
    return { count: notifications.filter((item) => !item.isRead).length, error: null }
  } catch (error) {
    return { count: 0, error: apiErrorMessage(error) }
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await (await serverApi()).put(`/dashboard/notifications/${encodeURIComponent(id)}/read`)
    await invalidateCurrentNotificationCache()
    revalidatePath("/dashboard/notifications")
    return { success: true }
  } catch (error) {
    return { success: false, error: apiErrorMessage(error) }
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await (await serverApi()).put("/dashboard/notifications/read-all")
    await invalidateCurrentNotificationCache()
    revalidatePath("/dashboard/notifications")
    return { success: true }
  } catch (error) {
    return { success: false, error: apiErrorMessage(error) }
  }
}
