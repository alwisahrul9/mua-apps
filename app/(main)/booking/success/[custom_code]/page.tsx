import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingSuccessClient from "./BookingSuccessClient";

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ custom_code: string }>;
}) {
  const { custom_code } = await params;

  // Cari booking berdasarkan customCode
  const booking = await prisma.booking.findUnique({
    where: { customCode: custom_code },
  });

  // Jika booking tidak ditemukan, kembalikan ke form
  if (!booking) {
    redirect("/booking");
  }

  // Jika batas waktu pembayaran sudah lewat, redirect ke form booking
  if (new Date() > booking.paymentDeadline) {
    redirect("/booking?error=expired");
  }

  return (
    <BookingSuccessClient
      clientName={booking.clientName}
      customCode={booking.customCode}
      totalPrice={booking.totalPrice}
      dpAmount={booking.dpAmount}
      paymentDeadline={booking.paymentDeadline}
    />
  );
}
