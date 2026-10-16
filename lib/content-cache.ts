import "server-only"

import { createHash } from "node:crypto"
import { unstable_cache, updateTag } from "next/cache"
import { auth } from "@/auth"
import { createApiClient, unwrapData, unwrapList } from "@/lib/api/client"
import type { Paginated, Portfolio, Service } from "@/lib/api/types"
import { getCachedMuaProfile } from "@/lib/profile-cache"

const CONTENT_CACHE_SECONDS = 15 * 60

export function servicesCacheTag(userId: string) {
  return `services:${userId}`
}

export function publicServicesCacheTag(username: string) {
  return `public-services:${username.trim().toLowerCase()}`
}

export function portfoliosCacheTag(userId: string) {
  return `portfolios:${userId}`
}

export function publicPortfoliosCacheTag(username: string) {
  return `public-portfolios:${username.trim().toLowerCase()}`
}

function tokenFingerprint(accessToken: string) {
  return createHash("sha256").update(accessToken).digest("hex")
}

export async function getCachedServices(
  userId: string,
  accessToken: string,
  page = 1,
): Promise<Paginated<Service>> {
  return unstable_cache(
    async () => {
      const response = await createApiClient(accessToken).get(
        "/dashboard/services",
        { params: { page } },
      )
      return unwrapList<Service>(response.data)
    },
    ["dashboard-services", userId, tokenFingerprint(accessToken), String(page)],
    {
      revalidate: CONTENT_CACHE_SECONDS,
      tags: [servicesCacheTag(userId)],
    },
  )()
}

export async function getCachedService(
  userId: string,
  accessToken: string,
  id: string,
) {
  return unstable_cache(
    async () => {
      const response = await createApiClient(accessToken).get(
        `/dashboard/services/${encodeURIComponent(id)}`,
      )
      return unwrapData<Service>(response.data)
    },
    ["dashboard-service", userId, tokenFingerprint(accessToken), id],
    {
      revalidate: CONTENT_CACHE_SECONDS,
      tags: [servicesCacheTag(userId)],
    },
  )()
}

export async function getCachedPortfolios(
  userId: string,
  accessToken: string,
) {
  return unstable_cache(
    async () => {
      const response = await createApiClient(accessToken).get(
        "/dashboard/portfolios",
      )
      return unwrapList<Portfolio>(response.data).data
    },
    ["dashboard-portfolios", userId, tokenFingerprint(accessToken)],
    {
      revalidate: CONTENT_CACHE_SECONDS,
      tags: [portfoliosCacheTag(userId)],
    },
  )()
}

export async function getCachedPortfolio(
  userId: string,
  accessToken: string,
  id: string,
) {
  return unstable_cache(
    async () => {
      const response = await createApiClient(accessToken).get(
        `/dashboard/portfolios/${encodeURIComponent(id)}`,
      )
      return unwrapData<Portfolio>(response.data)
    },
    ["dashboard-portfolio", userId, tokenFingerprint(accessToken), id],
    {
      revalidate: CONTENT_CACHE_SECONDS,
      tags: [portfoliosCacheTag(userId)],
    },
  )()
}

async function currentCacheIdentity() {
  const session = await auth()
  if (!session?.user?.id) return null

  const profile = session.accessToken
    ? await getCachedMuaProfile(session.user.id, session.accessToken).catch(
        () => session.user.profile,
      )
    : session.user.profile

  return { userId: session.user.id, username: profile?.username }
}

/** Hanya panggil fungsi ini dari Server Action setelah mutasi layanan berhasil. */
export async function invalidateCurrentServicesCache() {
  const identity = await currentCacheIdentity()
  if (!identity) return

  updateTag(servicesCacheTag(identity.userId))
  if (identity.username?.trim()) {
    updateTag(publicServicesCacheTag(identity.username))
  }
}

/** Hanya panggil fungsi ini dari Server Action setelah mutasi portofolio berhasil. */
export async function invalidateCurrentPortfoliosCache() {
  const identity = await currentCacheIdentity()
  if (!identity) return

  updateTag(portfoliosCacheTag(identity.userId))
  if (identity.username?.trim()) {
    updateTag(publicPortfoliosCacheTag(identity.username))
  }
}

export const contentCacheSeconds = CONTENT_CACHE_SECONDS
