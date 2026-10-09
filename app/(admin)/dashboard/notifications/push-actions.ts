"use server"

import { apiErrorMessage } from "@/lib/api/client"
import { serverApi } from "@/lib/api/server"

export async function subscribeUser(subscription: PushSubscriptionJSON) {
  const endpoint = subscription.endpoint
  const p256dh = subscription.keys?.p256dh
  const auth = subscription.keys?.auth

  if (!endpoint || !p256dh || !auth) {
    return {
      success: false,
      error: "Data keamanan push notification tidak lengkap. Silakan coba aktifkan kembali.",
    }
  }

  try {
    await (await serverApi()).post("/dashboard/push-subscriptions", {
      endpoint,
      p256dh,
      auth,
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: apiErrorMessage(error) }
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    await (await serverApi()).delete("/dashboard/push-subscriptions", { data: { endpoint } })
    return { success: true }
  } catch (error) {
    return { success: false, error: apiErrorMessage(error) }
  }
}
