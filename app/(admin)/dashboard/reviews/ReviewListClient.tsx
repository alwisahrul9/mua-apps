"use client";

import { useState } from "react";
import {
  ChevronDown,
  Filter,
  Loader2,
  MessageSquareText,
  Star,
} from "lucide-react";
import type { Review, Service } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardReviews } from "./actions";

const ALL_SERVICES = "all";

function reviewServiceName(review: Review) {
  return review.service?.name || review.serviceName || "Layanan tidak tersedia";
}

function ReviewStars({ rating }: { rating: number }) {
  const normalizedRating = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${normalizedRating} dari 5 bintang`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < normalizedRating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewListClient({
  services,
  initialReviews,
  initialPage,
  initialLastPage,
  initialTotal,
}: {
  services: Service[];
  initialReviews: Review[];
  initialPage: number;
  initialLastPage: number;
  initialTotal: number;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedService, setSelectedService] = useState(ALL_SERVICES);
  const [page, setPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleServiceChange(value: string | null) {
    const nextService = value || ALL_SERVICES;
    setSelectedService(nextService);
    setLoading(true);
    setError(null);

    const result = await getDashboardReviews(
      1,
      nextService === ALL_SERVICES ? undefined : nextService,
    );

    if (result.error) {
      setError(result.error);
    } else {
      setReviews(result.data);
      setPage(result.currentPage);
      setLastPage(result.lastPage);
      setTotal(result.total);
    }
    setLoading(false);
  }

  async function loadMore() {
    if (loadingMore || page >= lastPage) return;
    setLoadingMore(true);
    setError(null);

    const result = await getDashboardReviews(
      page + 1,
      selectedService === ALL_SERVICES ? undefined : selectedService,
    );

    if (result.error) {
      setError(result.error);
    } else {
      setReviews((current) => {
        const ids = new Set(current.map((review) => review.id));
        return [
          ...current,
          ...result.data.filter((review) => !ids.has(review.id)),
        ];
      });
      setPage(result.currentPage);
      setLastPage(result.lastPage);
      setTotal(result.total);
    }
    setLoadingMore(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Review</h1>
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground-dark sm:text-base">
            Lihat penilaian klien untuk setiap layanan Anda.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label
            htmlFor="service-review-filter"
            className="mb-2 block text-sm font-medium"
          >
            Filter Layanan
          </label>
          <div className="relative">
            {loading ? (
              <Loader2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground dark:text-muted-foreground-dark" />
            ) : (
              <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground-dark" />
            )}
            <select
              id="service-review-filter"
              value={selectedService}
              onChange={(event) =>
                void handleServiceChange(event.target.value)
              }
              disabled={loading}
              className="h-11 w-full appearance-none rounded-xl border border-input bg-background py-2 pl-10 pr-10 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-wait disabled:opacity-60 dark:bg-background-dark dark:text-foreground-dark"
            >
              <option value={ALL_SERVICES}>Semua Layanan</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground-dark" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground dark:text-muted-foreground-dark">
        <p>{total} review ditemukan</p>
        {selectedService !== ALL_SERVICES && (
          <Button
            type="button"
            variant="link"
            className="h-auto px-0"
            disabled={loading}
            onClick={() => void handleServiceChange(ALL_SERVICES)}
          >
            Hapus Filter
          </Button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl bg-muted dark:bg-muted-dark"
            />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="rounded-2xl border-foreground/10 bg-background shadow-sm dark:border-foreground-dark/10 dark:bg-background-dark"
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold" title={review.clientName}>
                      {review.clientName}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground dark:text-muted-foreground-dark">
                      {reviewServiceName(review)}
                    </p>
                  </div>
                  <ReviewStars rating={Number(review.rating)} />
                </div>

                <p className="line-clamp-5 flex-1 text-sm leading-6 text-foreground/80 dark:text-foreground-dark/80">
                  {review.reviewText}
                </p>

                <div className="border-t border-foreground/5 pt-3 text-xs text-muted-foreground dark:border-foreground-dark/5 dark:text-muted-foreground-dark">
                  {new Date(review.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Asia/Jakarta",
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-foreground/10 shadow-sm dark:border-foreground-dark/10">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center sm:p-14">
            <MessageSquareText className="h-11 w-11 text-muted-foreground/40 dark:text-muted-foreground-dark/40" />
            <h2 className="mt-4 font-medium">Belum Ada Review</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground dark:text-muted-foreground-dark">
              Review yang dikirim oleh klien akan ditampilkan di halaman ini.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && page < lastPage && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="h-11 rounded-full px-6"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
          </Button>
        </div>
      )}
    </div>
  );
}
