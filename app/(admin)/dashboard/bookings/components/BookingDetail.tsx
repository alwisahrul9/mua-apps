"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Info,
  User,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Edit2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventTime } from "@/lib/date-time";
import type { Booking } from "@/lib/api/types";
import ReviewLinkButton from "./ReviewLinkButton";
import { CardFooter } from "@/components/ui/card";

export default function BookingDetail({ booking }: { booking: Booking }) {
  const [copied, setCopied] = useState(false);
  const addOns = booking.addOns ?? [];
  const totalPrice = Number(booking.totalPrice) || 0;
  const dpAmount = Number(booking.dpAmount) || 0;
  const addOnSubtotal = addOns.reduce(
    (total, addOn) => total + (Number(addOn.subtotal) || 0),
    0,
  );
  const serviceSubtotal =
    Number(booking.serviceSubtotal) || Math.max(0, totalPrice - addOnSubtotal);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "dp_paid":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const addOnQuantity = (unit: string | null | undefined, quantity: number) => {
    const label =
      unit === "hourly" ? "jam" : unit === "person" ? "orang" : "item";
    return `${quantity} ${label}`;
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-8">
      <Link
        href="/dashboard/bookings"
        className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-muted-foreground-dark dark:hover:bg-muted-dark dark:hover:text-foreground-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Booking
      </Link>

      <section className="overflow-hidden rounded-3xl border border-foreground/10 bg-background shadow-sm dark:border-foreground-dark/10 dark:bg-background-dark">
        {/* Header */}
        <header className="flex items-start justify-between border-b border-foreground/10 p-5 text-left dark:border-foreground-dark/10 sm:p-6">
          <div>
            <h1 className="text-2xl font-bold">Detail Booking</h1>
            <p className="text-muted-foreground dark:text-muted-foreground-dark font-mono mt-1 text-sm">
              {booking.customCode || `#${booking.id}`}
            </p>
          </div>
        </header>

        {/* Body */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Client & Event Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-3">
                  Informasi Klien
                </h3>
                <div className="space-y-3 bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                        Nama
                      </p>
                      <p className="font-medium">{booking.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                        WhatsApp
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{booking.whatsapp}</p>
                        <Link
                          href={`https://wa.me/${booking.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-md hover:bg-green-200 transition-colors"
                          title="Chat via WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Chat
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                        Instagram
                      </p>
                      <div className="flex items-center gap-2">
                        {booking.instagram ? (
                          <>
                            <p className="font-medium">@{booking.instagram}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  booking.instagram!,
                                );
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="h-7 w-7 bg-muted dark:bg-muted-dark hover:bg-muted-foreground/10 text-muted-foreground dark:text-muted-foreground-dark rounded-md"
                              title="Salin Username"
                            >
                              {copied ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <p className="font-medium">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-3">
                  Detail Acara
                </h3>
                <div className="space-y-3 bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                        Nama Acara
                      </p>
                      <p className="font-medium">{booking.eventName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                        Tanggal & Waktu
                      </p>
                      <p className="font-medium">
                        {new Date(booking.eventDate).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            timeZone: "Asia/Jakarta",
                          },
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                        {formatEventTime(booking.eventTime)} WIB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                        Lokasi
                      </p>
                      <p className="font-medium line-clamp-2">
                        {booking.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Service & Payment Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-3">
                  Layanan
                </h3>
                <div className="space-y-3 bg-primary/5 dark:bg-primary-dark/5 dark:bg-primary dark:bg-primary-dark/5 p-4 rounded-2xl border border-primary/20 dark:border-primary-dark/20 dark:border-primary dark:border-primary-dark/20">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                      Paket Layanan
                    </p>
                    <p className="font-semibold text-lg">
                      {booking.service?.name ?? "Layanan Tidak Tersedia"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center border-t border-primary/10 dark:border-primary-dark/10 dark:border-primary dark:border-primary-dark/10 pt-3">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                      Jumlah Orang
                    </p>
                    <p className="font-medium">{booking.totalPerson} Orang</p>
                  </div>
                  <div className="border-t border-primary/10 pt-3 dark:border-primary-dark/10">
                    <p className="mb-2 text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Add-on Dipilih
                    </p>
                    {addOns.length > 0 ? (
                      <div className="space-y-2">
                        {addOns.map((addOn, index) => (
                          <div
                            key={`${addOn.id}-${index}`}
                            className="flex items-start justify-between gap-3 rounded-xl bg-background/70 px-3 py-2 dark:bg-background-dark/60"
                          >
                            <p className="font-medium">{addOn.name}</p>
                            <p className="shrink-0 text-sm text-muted-foreground dark:text-muted-foreground-dark">
                              {addOn.billingType === "flat"
                                ? "1 paket"
                                : addOnQuantity(addOn.unit, addOn.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium">Tidak ada add-on</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-3">
                  Pembayaran
                </h3>
                <div className="space-y-4 bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(booking.status)} uppercase tracking-wider font-medium text-xs px-3 py-1 rounded-full border-none`}
                    >
                      {booking.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="space-y-2 border-t border-foreground/10 pt-3 dark:border-foreground-dark/10">
                    <p className="text-sm font-medium">Rincian Harga</p>
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <div>
                        <p>{booking.service?.name ?? "Layanan"}</p>
                        {Number(booking.servicePrice) > 0 && (
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                            {formatCurrency(Number(booking.servicePrice))} ×{" "}
                            {booking.totalPerson} orang
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 font-medium">
                        {formatCurrency(serviceSubtotal)}
                      </p>
                    </div>
                    {addOns.map((addOn, index) => (
                      <div
                        key={`price-${addOn.id}-${index}`}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <div>
                          <p>{addOn.name}</p>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                            {formatCurrency(addOn.unitPrice)} × {addOn.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 font-medium">
                          {formatCurrency(addOn.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-foreground/10 pt-3 dark:border-foreground-dark/10">
                    <p className="font-medium">Total Harga</p>
                    <p className="font-semibold">{formatCurrency(totalPrice)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                      DP (Down Payment)
                    </p>
                    <p className="font-medium text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark">
                      {formatCurrency(dpAmount)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                      Sisa Pembayaran
                    </p>
                    <p className="font-medium text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark">
                      {formatCurrency(totalPrice - dpAmount)}
                    </p>
                  </div>
                  <div className="border-t border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 pt-3 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                        Tenggat Waktu Bayar DP
                      </p>
                      <p className="font-medium text-sm">
                        {new Date(booking.paymentDeadline).toLocaleString(
                          "id-ID",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Jakarta",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-2">
                    Catatan Tambahan
                  </h3>
                  <p className="text-sm bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-4 rounded-xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5 italic">
                    &ldquo;{booking.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {booking.status === "COMPLETED" && (
          <div className="border-t border-foreground/10 bg-muted/20 p-5 dark:border-foreground-dark/10 dark:bg-muted-dark/20 sm:p-6">
            <p className="mb-3 text-sm text-muted-foreground dark:text-muted-foreground-dark">
              Kirim tautan satu kali kepada klien untuk meminta ulasan setelah
              layanan selesai.
            </p>
            <ReviewLinkButton bookingId={booking.id} />
          </div>
        )}
        {booking.status !== "COMPLETED" && booking.status !== "CANCELED" && (
          <CardFooter className="justify-end border-t border-foreground/10 bg-muted/20 p-5 dark:border-foreground-dark/10 dark:bg-muted-dark/20 sm:p-6">
            <Button
              render={<Link href={`/dashboard/bookings/${booking.id}/edit`} />}
              nativeButton={false}
              className="h-11 w-full mt-5 rounded-xl px-6 sm:w-auto"
            >
              <Edit2 className="w-4 h-4" />
              Edit Booking
            </Button>
          </CardFooter>
        )}
      </section>
    </div>
  );
}
