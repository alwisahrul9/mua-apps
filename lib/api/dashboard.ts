import "server-only"

import { serverApi } from "@/lib/api/server"
import { unwrapData, unwrapList } from "@/lib/api/client"
import type { Booking, Notification, Paginated, Portfolio, Service } from "@/lib/api/types"

export async function listServices(page = 1): Promise<Paginated<Service>> {
  const response = await (await serverApi()).get("/dashboard/services", {
    params: { page },
  })
  return unwrapList<Service>(response.data)
}

export async function getService(id: string) {
  const response = await (await serverApi()).get(`/dashboard/services/${encodeURIComponent(id)}`)
  return unwrapData<Service>(response.data)
}

export async function listPortfolios() {
  const response = await (await serverApi()).get("/dashboard/portfolios")
  return unwrapList<Portfolio>(response.data).data
}

export async function getPortfolio(id: string) {
  const response = await (await serverApi()).get(`/dashboard/portfolios/${encodeURIComponent(id)}`)
  return unwrapData<Portfolio>(response.data)
}

export async function listBookings(params?: Record<string, string | number | undefined>): Promise<Paginated<Booking>> {
  const response = await (await serverApi()).get("/dashboard/bookings", { params })
  return unwrapList<Booking>(response.data)
}

export async function getBooking(id: string) {
  const response = await (await serverApi()).get(`/dashboard/bookings/${encodeURIComponent(id)}`)
  return unwrapData<Booking>(response.data)
}

export async function listNotifications() {
  const response = await (await serverApi()).get("/dashboard/notifications")
  return unwrapList<Notification>(response.data).data
}
