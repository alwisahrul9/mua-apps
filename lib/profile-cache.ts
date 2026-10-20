import "server-only"

import { createHash } from "node:crypto"
import { cache } from "react"
import { unstable_cache, updateTag } from "next/cache"
import { auth } from "@/auth"
import { createApiClient } from "@/lib/api/client"
import type { MuaProfile } from "@/lib/api/types"
import { extractMuaProfile } from "@/lib/profile"

const PROFILE_CACHE_SECONDS = 15 * 60

export function authenticatedProfileCacheTag(userId: string) {
  return `mua-profile:${userId}`
}

export function publicProfileCacheTag(username: string) {
  return `public-mua-profile:${username.trim().toLowerCase()}`
}

export const publicMuaListCacheTag = "public-mua-list"

export async function getCachedMuaProfile(
  userId: string,
  accessToken: string,
): Promise<MuaProfile | null> {
  // Token tidak disimpan sebagai teks mentah di cache key. Fingerprint tetap
  // membedakan sesi jika token pengguna diperbarui.
  const tokenFingerprint = createHash("sha256")
    .update(accessToken)
    .digest("hex")

  return unstable_cache(
    async () => {
      const response = await createApiClient(accessToken).get("/user/profile")
      return extractMuaProfile(response.data)
    },
    ["authenticated-mua-profile", userId, tokenFingerprint],
    {
      revalidate: PROFILE_CACHE_SECONDS,
      tags: [authenticatedProfileCacheTag(userId)],
    },
  )()
}

export const getCurrentMuaProfile = cache(async () => {
  const session = await auth()
  if (!session?.user?.id || !session.accessToken) return null

  return getCachedMuaProfile(session.user.id, session.accessToken).catch(
    () => session.user.profile,
  )
})

/** Hanya panggil fungsi ini dari Server Action setelah mutasi profil berhasil. */
export async function invalidateCurrentMuaProfileCache(username?: string | null) {
  const session = await auth()
  if (session?.user?.id) {
    updateTag(authenticatedProfileCacheTag(session.user.id))
  }

  if (username?.trim()) {
    updateTag(publicProfileCacheTag(username))
  }
  updateTag(publicMuaListCacheTag)
}

export const profileCacheSeconds = PROFILE_CACHE_SECONDS
