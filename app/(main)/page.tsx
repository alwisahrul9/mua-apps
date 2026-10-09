import type { Metadata } from "next";
import PlatformLanding from "@/components/PlatformLanding";
import { siteConfig } from "@/lib/site-config";

const title = "JadiCantik — Platform Booking dan Website untuk MUA";
const description =
  "Buat website MUA profesional, tampilkan portofolio, kelola layanan, dan terima booking klien dalam satu platform yang mudah digunakan.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "aplikasi MUA",
    "website makeup artist",
    "aplikasi booking MUA",
    "platform makeup artist Indonesia",
    "manajemen bisnis MUA",
    "portofolio MUA online",
  ],
  alternates: { canonical: siteConfig.url },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title,
    description,
    url: siteConfig.url,
    siteName: "JadiCantik",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/icon.png",
        alt: "JadiCantik untuk Makeup Artist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/icon.png"],
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: "JadiCantik",
        url: siteConfig.url,
        description,
        inLanguage: "id-ID",
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        url: siteConfig.url,
        logo: `${siteConfig.url}/icon.png`,
        description,
        sameAs: [
          siteConfig.instagramUrl,
          siteConfig.tiktokUrl,
          siteConfig.googleBusinessUrl,
        ].filter(Boolean),
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteConfig.url}/#software`,
        name: "JadiCantik",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: siteConfig.url,
        description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          [
            "Apakah JadiCantik bisa digunakan gratis?",
            "Ya. MUA dapat membuat akun dan menyiapkan halaman untuk mulai menerima booking.",
          ],
          [
            "Apakah saya perlu bisa membuat website?",
            "Tidak. Halaman publik terbentuk otomatis dari data yang Anda kelola melalui dashboard.",
          ],
          [
            "Apakah klien harus login untuk booking?",
            "Tidak. Klien dapat melihat layanan dan mengisi booking langsung dari halaman MUA.",
          ],
        ].map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  };

  return (
    <>
      <script
        id="platform-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\u003c"),
        }}
      />
      <PlatformLanding />
    </>
  );
}
