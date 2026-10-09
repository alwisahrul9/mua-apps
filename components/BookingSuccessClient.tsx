"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Check, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { PaymentMethod } from "@/lib/api/types";

interface BookingSuccessClientProps {
  clientName: string;
  customCode: string;
  totalPrice: number;
  dpAmount: number;
  paymentDeadline: Date;
  totalPerson: number;
  homeHref?: string;
  homePageIsActive: boolean;
  whatsappNumber?: string | null;
  paymentMethod?: PaymentMethod[] | null;
}

export default function BookingSuccessClient({
  clientName,
  customCode,
  totalPrice,
  dpAmount,
  paymentDeadline,
  totalPerson,
  homeHref = "/",
  homePageIsActive,
  whatsappNumber,
  paymentMethod,
}: BookingSuccessClientProps) {
  const [copiedAccountNumber, setCopiedAccountNumber] = useState<string | null>(
    null,
  );

  const accounts = (paymentMethod ?? []).filter(
    (method) => method.accountNumber.trim().length > 0,
  );

  const handleCopy = async (accountNumber: string) => {
    await navigator.clipboard.writeText(accountNumber);
    setCopiedAccountNumber(accountNumber);
    window.setTimeout(() => {
      setCopiedAccountNumber((current) =>
        current === accountNumber ? null : current,
      );
    }, 2000);
  };

  const getPhone = whatsappNumber || process.env.NEXT_PUBLIC_PHONE_NUMBER;

  const whatsappMessage = encodeURIComponent(
    `Halo, saya ${clientName} ingin konfirmasi DP untuk Kode Booking: ${customCode}. Berikut adalah bukti transfer saya.`,
  );
  const whatsappUrl = `https://wa.me/${getPhone}?text=${whatsappMessage}`;
  const returnHref = homePageIsActive ? homeHref : `${homeHref}/booking`;

  return (
    <div className="min-h-dvh pt-24 pb-12 px-4 container-custom flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background-dark border border-foreground-dark/10 rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-dark/20 rounded-full flex items-center justify-center text-primary-dark">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl mb-2">
            Booking Diterima!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground-dark mb-6 sm:mb-8">
            Booking ID:{" "}
            <span className="font-mono font-medium text-foreground-dark break-all">
              {customCode}
            </span>
          </p>

          <div className="bg-muted-dark/50 rounded-2xl p-4 sm:p-6 text-left mb-8 space-y-4">
            <h3 className="font-medium text-base sm:text-lg border-b border-foreground-dark/10 pb-3 sm:pb-4 mb-3 sm:mb-4">
              Ringkasan Pembayaran
            </h3>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1 sm:gap-0">
              <span className="text-muted-foreground-dark">Jumlah Orang</span>
              <span className="font-medium">{totalPerson} Orang</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1 sm:gap-0">
              <span className="text-muted-foreground-dark">Total Layanan</span>
              <span className="font-medium">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1 sm:gap-0">
              <span className="text-muted-foreground-dark">
                DP yang harus dibayar {dpAmount > 50000 ? "(30%)" : ""}
              </span>
              <span className="font-medium text-primary-dark text-base sm:text-lg">
                Rp {dpAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="mt-5 sm:mt-6 pt-4 border-t border-foreground-dark/10">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 bg-red-500/10 border border-red-500/20 p-3 sm:p-4 rounded-xl">
                <span className="text-sm font-medium text-red-600">
                  Bayar Sebelum
                </span>
                <span className="text-sm font-bold text-red-600">
                  {new Intl.DateTimeFormat("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                    timeZone: "Asia/Jakarta",
                  }).format(new Date(paymentDeadline))}
                </span>
              </div>

              <p className="text-sm text-muted-foreground-dark mb-3">
                Transfer ke salah satu rekening berikut:
              </p>
              {accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((account, index) => (
                    <div
                      key={`${account.paymentName}-${account.accountNumber}-${index}`}
                      className="flex items-center justify-between bg-background-dark border border-foreground-dark/10 p-3 sm:p-4 rounded-xl gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {account.paymentName}{" "}
                          <span className="text-xs sm:text-sm text-muted-foreground-dark font-normal inline-block">
                            a.n. {account.accountName}
                          </span>
                        </p>
                        <p className="font-mono text-base sm:text-lg tracking-wide sm:tracking-wider truncate">
                          {account.accountNumber}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(account.accountNumber)}
                        className="p-2 shrink-0 hover:bg-muted-dark rounded-full transition-colors"
                        title={`Salin nomor ${account.paymentName}`}
                        aria-label={`Salin nomor ${account.paymentName} ${account.accountNumber}`}
                      >
                        {copiedAccountNumber === account.accountNumber ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-muted-foreground-dark" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-foreground-dark/10 bg-background-dark p-4 text-sm text-muted-foreground-dark">
                  Metode pembayaran belum tersedia. Hubungi MUA untuk
                  mendapatkan informasi pembayaran.
                </p>
              )}
            </div>
          </div>

          <div className="text-sm sm:text-base text-muted-foreground-dark mb-6 bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl text-left space-y-2">
            <p className="font-medium text-foreground-dark">
              Langkah Selanjutnya:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 ml-1">
              <li>Lakukan transfer DP ke salah satu rekening di atas.</li>
              <li>
                Klik tombol <strong>Konfirmasi via WhatsApp</strong> di bawah.
              </li>
              <li>Kirimkan bukti transfer pada chat WhatsApp.</li>
              <li>Tunggu konfirmasi dari pihak MUA kami.</li>
            </ol>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 sm:py-4 bg-[#25D366] text-white rounded-full font-medium transition-all hover:bg-[#20b858] flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <MessageCircle className="w-5 h-5" />
              Konfirmasi via WhatsApp
            </a>

            <Link
              href={returnHref}
              className="w-full py-3.5 sm:py-4 bg-transparent text-foreground-dark border border-foreground-dark/20 rounded-full font-medium transition-all hover:bg-muted-dark flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {homePageIsActive
                ? "Kembali ke Homepage MUA"
                : "Kembali ke Halaman Booking"}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
