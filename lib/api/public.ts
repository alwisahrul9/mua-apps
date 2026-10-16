import { cache } from "react"
import { publicApi, unwrapData, unwrapList } from "@/lib/api/client"
import type { Booking, MuaProfile, Portfolio, Service } from "@/lib/api/types"

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
  const response = await publicApi.get(`/mua/${encodeURIComponent(slug)}`)
  return unwrapData<MuaProfile>(response.data)
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

export async function getPublicServices(slug: string) {
  const response = await publicApi.get(`/mua/${encodeURIComponent(slug)}/services`)
  return unwrapList<Service>(response.data).data
}

export async function getPublicPortfolios(slug: string) {
  const response = await publicApi.get(`/mua/${encodeURIComponent(slug)}/portfolios`)
  return unwrapList<Portfolio>(response.data).data
}

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
