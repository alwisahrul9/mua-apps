"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Check, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BookingSuccessClientProps {
  clientName: string;
  customCode: string;
  totalPrice: number;
  dpAmount: number;
  paymentDeadline: Date;
}

export default function BookingSuccessClient({
  clientName,
  customCode,
  totalPrice,
  dpAmount,
  paymentDeadline
}: BookingSuccessClientProps) {
  const [copiedSeabank, setCopiedSeabank] = useState(false);
  const [copiedMandiri, setCopiedMandiri] = useState(false);
  const [copiedShopeePay, setCopiedShopeePay] = useState(false);

  const accounts = [
    { bank: "Mandiri", name: "a.n. NEIL ALDENA HAIDAR R", number: "1390024270658", copied: copiedSeabank, setCopied: setCopiedSeabank },
    { bank: "Seabank", name: "a.n. Neil Aldena Haidar Romansyah", number: "901219125057", copied: copiedMandiri, setCopied: setCopiedMandiri },
    { bank: "Shopeepay", name: "a.n. Neil Aldena", number: "085158480059", copied: copiedShopeePay, setCopied: setCopiedShopeePay },
  ];

  const handleCopy = (number: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPhone = process.env.NEXT_PUBLIC_PHONE_NUMBER

  const whatsappMessage = encodeURIComponent(
    `Halo, saya ${clientName} ingin konfirmasi DP untuk Kode Booking: ${customCode}. Berikut adalah bukti transfer saya.`
  );
  const whatsappUrl = `https://wa.me/${getPhone}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 container-custom flex items-center justify-center">
      <div className="max-w-xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background border border-foreground/10 rounded-3xl p-8 md:p-10 shadow-sm text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>

          <h1 className="font-serif text-3xl mb-2">Booking Diterima!</h1>
          <p className="text-muted-foreground mb-8">
            Booking ID: <span className="font-mono font-medium text-foreground">{customCode}</span>
          </p>

          <div className="bg-muted/50 rounded-2xl p-6 text-left mb-8 space-y-4">
            <h3 className="font-medium border-b border-foreground/10 pb-4 mb-4">Ringkasan Pembayaran</h3>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Layanan</span>
              <span className="font-medium">Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">DP yang harus dibayar (50%)</span>
              <span className="font-medium text-primary text-lg">Rp {dpAmount.toLocaleString("id-ID")}</span>
            </div>

            <div className="mt-6 pt-4 border-t border-foreground/10">
              <div className="flex justify-between items-center mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <span className="text-sm font-medium text-red-600">Bayar Sebelum</span>
                <span className="text-sm font-bold text-red-600">
                  {new Intl.DateTimeFormat('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  }).format(new Date(paymentDeadline))}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-3">Transfer ke salah satu rekening berikut:</p>
              <div className="space-y-3">
                {accounts.map((acc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-background border border-foreground/10 p-4 rounded-xl">
                    <div>
                      <p className="font-medium">{acc.bank} <span className="text-sm text-muted-foreground font-normal">{acc.name}</span></p>
                      <p className="font-mono text-lg tracking-wider">{acc.number}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(acc.number, acc.setCopied)}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                      title="Salin Nomor Rekening"
                    >
                      {acc.copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-6 bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl text-left space-y-2">
            <p className="font-medium text-foreground">Langkah Selanjutnya:</p>
            <ol className="list-decimal list-inside space-y-1.5 ml-1">
              <li>Lakukan transfer DP ke salah satu rekening di atas.</li>
              <li>Klik tombol <strong>Konfirmasi via WhatsApp</strong> di bawah.</li>
              <li>Kirimkan bukti transfer pada chat WhatsApp.</li>
              <li>Tunggu konfirmasi dari pihak MUA kami.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#25D366] text-white rounded-full font-medium transition-all hover:bg-[#20b858] flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Konfirmasi via WhatsApp
            </a>

            <Link
              href="/"
              className="w-full py-4 bg-transparent text-foreground border border-foreground/20 rounded-full font-medium transition-all hover:bg-muted flex items-center justify-center gap-2"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
