"use server";

import { revalidatePath } from "next/cache";
import { apiErrorMessage, unwrapData } from "@/lib/api/client";
import { getBooking, listBookings } from "@/lib/api/dashboard";
import { serverApi } from "@/lib/api/server";
import type { Booking, BookingStatus, ReviewInvitation } from "@/lib/api/types";
import { databaseTimeValue } from "@/lib/date-time";
import { siteConfig } from "@/lib/site-config";

export async function getBookings(
  page = 1,
  searchQuery?: string,
  statusFilter?: string,
) {
  try {
    const result = await listBookings({
      page,
      search: searchQuery?.trim() || undefined,
      status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
    });
    return {
      data: result.data,
      currentPage: result.currentPage ?? page,
      lastPage: result.lastPage ?? page,
    };
  } catch (error) {
    return {
      data: [],
      currentPage: page,
      lastPage: page,
      error: apiErrorMessage(error, "Gagal memuat booking."),
    };
  }
}

export async function getBookingDetail(id: string) {
  try {
    return { data: await getBooking(id) };
  } catch (error) {
    return { error: apiErrorMessage(error, "Booking tidak ditemukan.") };
  }
}

export async function updateBooking(
  id: string,
  data: { status: BookingStatus; eventDate: string; eventTime: string },
) {
  try {
    const response = await (
      await serverApi()
    ).put(`/dashboard/bookings/${encodeURIComponent(id)}`, {
      status: data.status,
      event_date: data.eventDate,
      event_time: databaseTimeValue(data.eventTime),
    });
    revalidatePath("/dashboard");
    return { data: unwrapData<Booking>(response.data) };
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal memperbarui booking.") };
  }
}

export async function createReviewLink(bookingId: string) {
  try {
    const response = await (
      await serverApi()
    ).post(`/dashboard/bookings/${encodeURIComponent(bookingId)}/review-link`);
    const invitation = unwrapData<ReviewInvitation>(response.data);
    const url =
      invitation.reviewUrl ||
      invitation.url ||
      (invitation.token
        ? `${siteConfig.url}/review?token=${encodeURIComponent(invitation.token)}`
        : "");
    if (!url) return { error: "Backend tidak mengembalikan tautan ulasan." };
    return { data: { ...invitation, url } };
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal membuat tautan ulasan.") };
  }
}
