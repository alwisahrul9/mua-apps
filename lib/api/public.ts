import { cache } from "react"
import { unstable_cache } from "next/cache"
import { publicApi, unwrapData, unwrapList } from "@/lib/api/client"
import type { Booking, MuaProfile, Portfolio, Service } from "@/lib/api/types"
import { profileCacheSeconds, publicProfileCacheTag } from "@/lib/profile-cache"
import {
  contentCacheSeconds,
  publicPortfoliosCacheTag,
  publicServicesCacheTag,
} from "@/lib/content-cache"

function unwrapBooking(payload: unknown): Booking {
  let current = payload

  for (let depth = 0; depth < 4; depth += 1) {
    const unwrapped = unwrapData<unknown>(current)
    if (!unwrapped || typeof unwrapped !== "object") break
    const normalized = unwrapped as Record<string, unknown>
    const customCode =
      normalized.customCode ?? normalized.bookingCode ?? normalized.code

    if (typeof customCode === "string" && customCode.trim()) {
      return {
        ...normalized,
        customCode: customCode.trim(),
      } as Booking
    }

    const nested = normalized.booking ?? normalized.data
    if (!nested || typeof nested !== "object" || nested === current) break
    current = nested
  }

  throw new Error("Kode booking tidak ditemukan pada respons server.")
}

export const getPublicMua = cache(async (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase()

  return unstable_cache(
    async () => {
      const response = await publicApi.get(
        `/mua/${encodeURIComponent(normalizedSlug)}`,
      )
      return unwrapData<MuaProfile>(response.data)
    },
    ["public-mua-profile", normalizedSlug],
    {
      revalidate: profileCacheSeconds,
      tags: [publicProfileCacheTag(normalizedSlug)],
    },
  )()
})

export async function listPublicMuas() {
  const profiles: MuaProfile[] = []
  let page = 1
  let lastPage = 1

  do {
    const response = await publicApi.get("/mua", {
      params: { page, per_page: 100 },
    })
    const result = unwrapList<MuaProfile>(response.data)
    profiles.push(...result.data)
    lastPage = Math.max(1, result.lastPage ?? 1)
    page += 1
  } while (page <= lastPage)

  return profiles
}

export const getPublicServices = cache(async (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase()
  return unstable_cache(
    async () => {
      const response = await publicApi.get(
        `/mua/${encodeURIComponent(normalizedSlug)}/services`,
      )
      return unwrapList<Service>(response.data).data
    },
    ["public-mua-services", normalizedSlug],
    {
      revalidate: contentCacheSeconds,
      tags: [publicServicesCacheTag(normalizedSlug)],
    },
  )()
})

export const getPublicPortfolios = cache(async (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase()
  return unstable_cache(
    async () => {
      const response = await publicApi.get(
        `/mua/${encodeURIComponent(normalizedSlug)}/portfolios`,
      )
      return unwrapList<Portfolio>(response.data).data
    },
    ["public-mua-portfolios", normalizedSlug],
    {
      revalidate: contentCacheSeconds,
      tags: [publicPortfoliosCacheTag(normalizedSlug)],
    },
  )()
})

export async function createPublicBooking(data: Record<string, unknown>) {
  const response = await publicApi.post("/bookings", data)
  return unwrapBooking(response.data)
}

export async function getPublicBooking(username: string, code: string) {
  const response = await publicApi.get("/bookings/check", {
    params: {
      username,
      custom_code: code,
    },
  })
  return unwrapBooking(response.data)
}
