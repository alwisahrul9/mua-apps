import "server-only"

import { createHash } from "node:crypto"
import { unstable_cache, updateTag } from "next/cache"
import { auth } from "@/auth"
import { createApiClient, unwrapList } from "@/lib/api/client"
import type { Notification } from "@/lib/api/types"
import { getCachedMuaProfile } from "@/lib/profile-cache"

const NOTIFICATION_CACHE_SECONDS = 10

export function notificationCacheTag(userId: string) {
  return `notifications:${userId}`
}

export function notificationUsernameCacheTag(username: string) {
  return `notifications:username:${username.trim().toLowerCase()}`
}

export async function getCachedNotifications(
  userId: string,
  accessToken: string,
  username?: string | null,
) {
  const tokenFingerprint = createHash("sha256")
    .update(accessToken)
    .digest("hex")
  const normalizedUsername = username?.trim().toLowerCase() ?? ""
  const tags = [notificationCacheTag(userId)]

  if (normalizedUsername) {
    tags.push(notificationUsernameCacheTag(normalizedUsername))
  }

  return unstable_cache(
    async () => {
      const response = await createApiClient(accessToken).get(
        "/dashboard/notifications",
      )
      return unwrapList<Notification>(response.data).data
    },
    ["dashboard-notifications", userId, tokenFingerprint],
    {
      revalidate: NOTIFICATION_CACHE_SECONDS,
      tags,
    },
  )()
}

/** Hanya panggil fungsi ini dari Server Action. */
export async function invalidateCurrentNotificationCache() {
  const session = await auth()
  if (!session?.user?.id) return

  updateTag(notificationCacheTag(session.user.id))

  const profile = session.accessToken
    ? await getCachedMuaProfile(session.user.id, session.accessToken).catch(
        () => session.user.profile,
      )
    : session.user.profile
  const username = profile?.username
  if (username?.trim()) {
    updateTag(notificationUsernameCacheTag(username))
  }
}
