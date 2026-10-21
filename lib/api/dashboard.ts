import "server-only";

import { serverApi } from "@/lib/api/server";
import { unwrapData, unwrapList } from "@/lib/api/client";
import type { Booking, Paginated, Service } from "@/lib/api/types";
import { auth } from "@/auth";
import { getCachedNotifications } from "@/lib/notification-cache";
import { getCachedMuaProfile } from "@/lib/profile-cache";
import {
  getCachedPortfolio,
  getCachedPortfolios,
  getCachedService,
  getCachedServices,
} from "@/lib/content-cache";

async function dashboardIdentity() {
  const session = await auth();
  if (!session?.user?.id || !session.accessToken) {
    throw new Error("Sesi pengguna tidak ditemukan.");
  }
  return { userId: session.user.id, accessToken: session.accessToken };
}

export async function listServices(page = 1): Promise<Paginated<Service>> {
  const session = await dashboardIdentity();
  return getCachedServices(session.userId, session.accessToken, page);
}

export async function getService(id: string) {
  const session = await dashboardIdentity();
  return getCachedService(session.userId, session.accessToken, id);
}

export async function listPortfolios() {
  const session = await dashboardIdentity();
  return getCachedPortfolios(session.userId, session.accessToken);
}

export async function getPortfolio(id: string) {
  const session = await dashboardIdentity();
  return getCachedPortfolio(session.userId, session.accessToken, id);
}

export async function listBookings(
  params?: Record<string, string | number | undefined>,
): Promise<Paginated<Booking>> {
  const response = await (
    await serverApi()
  ).get("/dashboard/bookings", { params });
  return unwrapList<Booking>(response.data);
}

export async function getBooking(id: string) {
  const response = await (
    await serverApi()
  ).get(`/dashboard/bookings/${encodeURIComponent(id)}`);
  return unwrapData<Booking>(response.data);
}

export async function listNotifications() {
  const session = await auth();
  if (!session?.user?.id || !session.accessToken) {
    throw new Error("Sesi pengguna tidak ditemukan.");
  }

  const profile = await getCachedMuaProfile(
    session.user.id,
    session.accessToken,
  ).catch(() => session.user.profile);

  return getCachedNotifications(
    session.user.id,
    session.accessToken,
    profile?.username,
  );
}
