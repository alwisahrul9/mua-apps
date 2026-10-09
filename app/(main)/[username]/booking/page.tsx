import BookingPageClient from "@/components/BookingPageClient";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublicMua } from "@/lib/api/public";
import { siteConfig } from "@/lib/site-config";

type PageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicMua(username).catch(() => null);
  if (!profile)
    return { title: "MUA Tidak Ditemukan", robots: { index: false } };
  return {
    title: `Booking ${profile.brandName}`,
    description: `Pesan jadwal layanan makeup ${profile.brandName} secara online. Pilih layanan, tanggal acara, dan lokasi Anda.`,
    alternates: { canonical: `${siteConfig.url}/${username}/booking` },
    robots: { index: false, follow: true },
  };
}

export default async function TenantBookingPage({ params }: PageProps) {
  const { username } = await params;
  const profile = await getPublicMua(username).catch(() => null);
  if (!profile) notFound();
  return (
    <>
      <Navbar username={username} brandName={profile.brandName} />
      <Suspense>
        <BookingPageClient slug={username} />
      </Suspense>
      <SiteFooter profile={profile} />
    </>
  );
}
