import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";
import BookingDetail from "../components/BookingDetail";
import { getBookingDetail } from "../actions";

export default async function BookingDetailPage({
  params,
}: PageProps<"/dashboard/bookings/[id]">) {
  const { id } = await params;
  const { data: booking, error } = await getBookingDetail(id);

  if (error || !booking) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Booking Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground-dark">
          {error ?? "Data booking yang Anda cari tidak tersedia."}
        </p>
        <Link
          href="/dashboard/bookings"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-primary-dark dark:text-primary-foreground-dark dark:hover:bg-primary-dark/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Booking
        </Link>
      </div>
    );
  }

  return <BookingDetail booking={booking} />;
}
