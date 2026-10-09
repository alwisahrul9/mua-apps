import { redirect } from "next/navigation";
import { getPublicBooking, getPublicMua } from "@/lib/api/public";
import BookingSuccessClient from "@/components/BookingSuccessClient";

export default async function TenantBookingSuccessPage({
  params,
}: {
  params: Promise<{ username: string; custom_code: string }>;
}) {
  const { username, custom_code } = await params;
  const [booking, profile] = await Promise.all([
    getPublicBooking(username, custom_code).catch(() => null),
    getPublicMua(username).catch(() => null),
  ]);

  if (!booking || !profile) redirect(`/${username}/booking`);
  if (new Date() > new Date(booking.paymentDeadline)) {
    redirect(`/${username}/booking?error=expired`);
  }

  return (
    <BookingSuccessClient
      clientName={booking.clientName}
      customCode={booking.customCode}
      totalPrice={booking.totalPrice}
      dpAmount={booking.dpAmount}
      paymentDeadline={new Date(booking.paymentDeadline)}
      totalPerson={booking.totalPerson}
      homeHref={`/${username}`}
      homePageIsActive={profile.homepageIsActive}
      whatsappNumber={profile.whatsappNumber}
      paymentMethod={profile.paymentMethod}
    />
  );
}
