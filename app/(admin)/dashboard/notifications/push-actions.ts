"use server"

import { createHash } from "node:crypto"
import { auth as getSession } from "@/auth"
import { apiErrorMessage } from "@/lib/api/client"
import { serverApi } from "@/lib/api/server"

type RegistrationResponse = {
  data?: { id?: string; user_id?: string; server_fingerprint?: string }
}

type SubscriptionStatusResponse = {
  data?: Array<{
    id: string
    current_login: boolean
    login_active: boolean
    endpoint_fingerprint: string
  }>
  meta?: { recipient_user_id?: string; server_fingerprint?: string }
}

export async function subscribeUser(subscription: PushSubscriptionJSON, vapidPublicKey?: string | null) {
  const endpoint = subscription.endpoint
  const p256dh = subscription.keys?.p256dh
  const auth = subscription.keys?.auth

  if (!endpoint || !p256dh || !auth) {
    return {
      success: false,
      error: "Data keamanan push notification tidak lengkap. Silakan coba aktifkan kembali.",
    }
  }

  let backendHost: string | null = null
  let subscriptionId: string | null = null
  try {
    const session = await getSession()
    const expectedUserId = session?.user?.id
    if (!expectedUserId) throw new Error("Sesi tidak tersedia. Silakan login ulang.")
    const client = await serverApi()
    backendHost = new URL(client.defaults.baseURL ?? "").host
    const response = await client.post<RegistrationResponse>("/dashboard/push-subscriptions", {
      endpoint,
      p256dh,
      auth,
      ...(vapidPublicKey ? { vapid_public_key: vapidPublicKey } : {}),
    })
    const registered = response.data?.data
    if (response.status !== 201 || !registered?.id) {
      throw new Error("Backend tidak mengonfirmasi penyimpanan subscription notifikasi.")
    }
    subscriptionId = registered.id
    const status = await client.get<SubscriptionStatusResponse>("/dashboard/push-subscriptions", {
      headers: { "Cache-Control": "no-cache" },
    })
    const stored = Array.isArray(status.data?.data)
      ? status.data.data.find((item) => item.id === registered.id)
      : undefined
    const serverFingerprint = registered.server_fingerprint
    const ownerId = registered.user_id
    if (!stored?.current_login || !stored.login_active
      || stored.endpoint_fingerprint !== createHash("sha256").update(endpoint).digest("hex").slice(0, 16)
      || !ownerId || ownerId !== expectedUserId || status.data.meta?.recipient_user_id !== ownerId
      || !serverFingerprint || status.data.meta?.server_fingerprint !== serverFingerprint) {
      throw new Error("Subscription belum terkonfirmasi untuk akun dan sesi ini. Pastikan frontend dan backend memakai lingkungan yang sama, lalu login ulang.")
    }
    console.info("[push] Subscription registration verified", {
      backend_host: backendHost,
      subscription_id: registered.id,
      recipient_user_id: ownerId,
      server_fingerprint: serverFingerprint,
    })
    return { success: true, subscriptionId: registered.id, serverFingerprint }
  } catch (error) {
    console.error("[push] Subscription registration could not be verified", {
      backend_host: backendHost,
      subscription_id: subscriptionId,
    })
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
