import type { Metadata } from "next"
import { notFound } from "next/navigation"
import HomeClient from "@/components/HomeClient"
import { Navbar } from "@/components/Navbar"
import { SiteFooter } from "@/components/SiteFooter"
import {
  getPublicMua,
  getPublicPortfolios,
  getPublicServices,
} from "@/lib/api/public"
import { getMuaFaqs } from "@/lib/faqs"
import { siteConfig } from "@/lib/site-config"
import { publicMediaUrl } from "@/lib/media-url"

type PageProps = { params: Promise<{ username: string }> }

function profileUrl(username: string) {
  return `${siteConfig.url}/${encodeURIComponent(username)}`
}

function profileDescription(
  profile: Awaited<ReturnType<typeof getPublicMua>>,
) {
  const city = profile.serviceArea?.[0]
  return (
    profile.heroDescription?.trim() ||
    `${profile.brandName} menyediakan jasa makeup profesional${city ? ` di ${city}` : ""}. Lihat layanan, portofolio, wilayah pelayanan, dan pesan jadwal secara online.`
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  try {
    const profile = await getPublicMua(username)
    if (profile.homepageIsActive !== true) {
      return {
        title: "Homepage MUA Tidak Aktif",
        robots: { index: false, follow: false },
      }
    }

    const city = profile.serviceArea?.[0]
    const url = profileUrl(username)
    const title = `${profile.brandName} | Jasa MUA${city ? ` di ${city}` : ""}`
    const description = profileDescription(profile)
    const socialImage = publicMediaUrl(
      profile.coverImageUrl ||
      profile.profileImageUrl ||
      `${siteConfig.url}/icon.png`,
    )

    return {
      title: { absolute: title },
      description,
      keywords: [
        profile.brandName,
        "MUA",
        "makeup artist",
        "jasa makeup",
        ...(profile.serviceArea ?? []).flatMap((area) => [
          `MUA ${area}`,
          `jasa makeup ${area}`,
        ]),
      ],
      alternates: { canonical: url },
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
        url,
        siteName: siteConfig.name,
        locale: "id_ID",
        type: "website",
        images: [
          {
            url: socialImage,
            alt: `${profile.brandName}${city ? `, MUA di ${city}` : ""}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [socialImage],
      },
    }
  } catch {
    return {
      title: "Profil MUA Tidak Ditemukan",
      robots: { index: false, follow: false },
    }
  }
}

export default async function MuaPage({ params }: PageProps) {
  const { username } = await params
  const profile = await getPublicMua(username).catch(() => null)

  if (!profile || profile.homepageIsActive !== true) notFound()

  const [portfolioResult, serviceResult] = await Promise.allSettled([
    getPublicPortfolios(username),
    getPublicServices(username),
  ])
  const portfolios =
    portfolioResult.status === "fulfilled" ? portfolioResult.value : []
  const services =
    serviceResult.status === "fulfilled" ? serviceResult.value : []
  const url = profileUrl(username)
  const bookingUrl = `${url}/booking`
  const city = profile.serviceArea?.[0]
  const description = profileDescription(profile)
  const images = [profile.coverImageUrl, profile.profileImageUrl]
    .filter((image): image is string => Boolean(image))
    .map(publicMediaUrl)
  const instagramUrl = profile.instagramUsername
    ? `https://instagram.com/${profile.instagramUsername.replace(/^@/, "")}`
    : undefined
  const prices = services.map((service) => service.price).filter(Number.isFinite)
  const muaFaqs = getMuaFaqs(profile)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${profile.brandName}${city ? ` - Jasa MUA di ${city}` : ""}`,
        description,
        inLanguage: "id-ID",
        about: { "@id": `${url}#business` },
        primaryImageOfPage: images[0]
          ? { "@type": "ImageObject", url: images[0] }
          : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteConfig.name,
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: profile.brandName,
            item: url,
          },
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${url}#business`,
        name: profile.brandName,
        url,
        image: images.length > 0 ? images : [`${siteConfig.url}/icon.png`],
        logo: profile.profileImageUrl
          ? publicMediaUrl(profile.profileImageUrl)
          : undefined,
        description,
        telephone: profile.whatsappNumber
          ? `+${profile.whatsappNumber}`
          : undefined,
        sameAs: instagramUrl ? [instagramUrl] : undefined,
        areaServed: profile.serviceArea?.map((area) => ({
          "@type": "City",
          name: area,
        })),
        address: {
          "@type": "PostalAddress",
          streetAddress: profile.address || undefined,
          addressLocality: city || undefined,
          addressCountry: "ID",
        },
        priceRange:
          prices.length > 0
            ? `Rp${Math.min(...prices).toLocaleString("id-ID")}–Rp${Math.max(...prices).toLocaleString("id-ID")}`
            : undefined,
        hasOfferCatalog:
          services.length > 0
            ? {
                "@type": "OfferCatalog",
                name: `Layanan ${profile.brandName}`,
                itemListElement: services.map((service) => ({
                  "@type": "Offer",
                  priceCurrency: "IDR",
                  price: service.price,
                  url: bookingUrl,
                  itemOffered: {
                    "@type": "Service",
                    name: service.name,
                    description: service.description || undefined,
                  },
                })),
              }
            : undefined,
        potentialAction: {
          "@type": "ReserveAction",
          target: bookingUrl,
          name: `Booking ${profile.brandName}`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: muaFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  }

  return (
    <>
      <script
        id={`mua-structured-data-${profile.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar username={username} brandName={profile.brandName} />
      <HomeClient profile={profile} portfolios={portfolios} services={services} />
      <SiteFooter profile={profile} />
    </>
  )
}
