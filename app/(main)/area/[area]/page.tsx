import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MuaDirectoryCard } from "@/components/MuaDirectoryCard";
import { Navbar } from "@/components/Navbar";
import {
  getPublicMuaDirectory,
  formatSeoName,
  toSeoSlug,
} from "@/lib/seo-directory";
import { siteConfig } from "@/lib/site-config";

type PageProps = { params: Promise<{ area: string }> };

async function getAreaEntries(area: string) {
  const areaSlug = toSeoSlug(decodeURIComponent(area));
  const entries = await getPublicMuaDirectory({ city: areaSlug }).catch(
    () => [],
  );
  return entries.filter((entry) =>
    entry.profile.serviceArea?.some((area) => toSeoSlug(area) === areaSlug),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { area } = await params;
  const areaName = formatSeoName(area);
  const canonical = `${siteConfig.url}/area/${toSeoSlug(area)}`;
  const entries = await getAreaEntries(area).catch(() => []);
  const title = `Daftar MUA Profesional di ${areaName} | Harga & Portofolio`;
  const description = `Temukan dan booking makeup artist profesional di ${areaName}. Bandingkan service makeup wisuda, wedding, lamaran, pesta, harga, dan portofolio MUA.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: {
      index: entries.length > 0,
      follow: true,
      googleBot: {
        index: entries.length > 0,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "id_ID",
      type: "website",
    },
  };
}

export default async function AreaDirectoryPage({ params }: PageProps) {
  const { area } = await params;
  const areaSlug = toSeoSlug(decodeURIComponent(area));
  const areaName = formatSeoName(area);
  const entries = await getAreaEntries(area);
  if (!areaSlug || entries.length === 0) notFound();

  const url = `${siteConfig.url}/area/${areaSlug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: `Daftar Makeup Artist di ${areaName}`,
        description: `Direktori MUA untuk wisuda, wedding, lamaran, photoshoot, dan pesta di ${areaName}.`,
        inLanguage: "id-ID",
        mainEntity: { "@id": `${url}#list` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#list`,
        numberOfItems: entries.length,
        itemListElement: entries.map(({ profile }, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteConfig.url}/${encodeURIComponent(profile.username!)}`,
          name: profile.brandName,
        })),
      },
      {
        "@type": "BreadcrumbList",
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
            name: "Area",
            item: `${siteConfig.url}/area`,
          },
          { "@type": "ListItem", position: 3, name: areaName, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <main className="min-h-screen bg-background-dark pb-24 pt-32 text-foreground-dark">
        <div className="container-custom">
          <nav
            aria-label="Breadcrumb"
            className="text-sm text-muted-foreground-dark"
          >
            <Link href="/" className="hover:text-primary-dark">
              Beranda
            </Link>
            <span aria-hidden="true"> / </span>
            <span>MUA {areaName}</span>
          </nav>
          <header className="mt-8 max-w-3xl">
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
              Daftar Makeup Artist Profesional di {areaName}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground-dark">
              Cari MUA di {areaName} untuk makeup wisuda, wedding, lamaran,
              photoshoot, dan pesta. Bandingkan service, harga awal, wilayah
              pelayanan, serta portofolio sebelum melakukan booking.
            </p>
          </header>
          <p className="mt-10 text-sm text-muted-foreground-dark">
            Menampilkan {entries.length} makeup artist yang melayani {areaName}.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <MuaDirectoryCard key={entry.profile.id} entry={entry} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
