import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "MUA by Aldena Makeup - Layanan Makeup Profesional",
  description: "Layanan makeup eksklusif untuk pertunangan, wisuda, dan momen spesial Anda. Dapatkan tampilan flawless dan elegan yang memancarkan kecantikan natural Anda.",
  keywords: ["MUA", "Makeup Artist", "Makeup Wisuda", "Makeup Engagement", "Makeup Wedding", "Jasa Makeup Profesional"],
  verification: {
    google: `${process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION}`
  },
  openGraph: {
    title: "MUA by Aldena Makeup - Layanan Makeup Profesional",
    description: "Layanan makeup eksklusif untuk pertunangan, wisuda, dan momen spesial Anda. Dapatkan tampilan flawless dan elegan yang memancarkan kecantikan natural Anda.",
    url: "https://aldena.vercel.app",
    siteName: "MUA by Aldena Makeup",
    images: [
      {
        url: "https://nmntjgnmnzaekithicay.supabase.co/storage/v1/object/public/portfolios/images/icon.png",
        width: 1200,
        height: 630,
        alt: "MUA Portfolio Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MUA by Aldena's Makeup - Layanan Makeup Profesional",
    description: "Layanan makeup eksklusif untuk pertunangan, wisuda, dan momen spesial Anda.",
    images: ["https://nmntjgnmnzaekithicay.supabase.co/storage/v1/object/public/portfolios/images/icon.png"],
  },
  alternates: {
    canonical: "https://aldena.vercel.app",
  },
};

import { prisma } from "@/lib/prisma";

export default async function Home() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { createdAt: "desc" },
    take: 9,
  });

  const services = await prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" }
  });

  return <HomeClient portfolios={portfolios} services={services} />;
}
