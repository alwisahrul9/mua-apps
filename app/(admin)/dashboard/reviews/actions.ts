"use server";

import { apiErrorMessage } from "@/lib/api/client";
import { listDashboardReviews } from "@/lib/api/dashboard";

export async function getDashboardReviews(page = 1, serviceId?: string) {
  try {
    const result = await listDashboardReviews(
      Math.max(1, page),
      serviceId?.trim() || undefined,
    );

    return {
      data: result.data,
      currentPage: result.currentPage ?? page,
      lastPage: result.lastPage ?? page,
      total: result.total ?? result.data.length,
    };
  } catch (error) {
    return {
      data: [],
      currentPage: page,
      lastPage: page,
      total: 0,
      error: apiErrorMessage(error, "Gagal memuat daftar review."),
    };
  }
}
