import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "MUA by Aldena's Makeup - Layanan Makeup Profesional",
  description: "Layanan makeup eksklusif untuk pertunangan, wisuda, dan momen spesial Anda. Dapatkan tampilan flawless dan elegan yang memancarkan kecantikan natural Anda.",
  keywords: ["MUA", "Makeup Artist", "Makeup Wisuda", "Makeup Engagement", "Makeup Wedding", "Jasa Makeup Profesional"],
  openGraph: {
    title: "MUA by Aldena's Makeup - Layanan Makeup Profesional",
    description: "Layanan makeup eksklusif untuk pertunangan, wisuda, dan momen spesial Anda.",
    url: "https://aldenas.vercel.app",
    siteName: "MUA Portfolio",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
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
    images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop"],
  },
  alternates: {
    canonical: "https://aldenas.vercel.app",
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
