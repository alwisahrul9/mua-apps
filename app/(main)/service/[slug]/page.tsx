import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MuaDirectoryCard } from "@/components/MuaDirectoryCard";
import { Navbar } from "@/components/Navbar";
import {
  getPublicMuaDirectory,
  getServiceCategory,
  serviceMatchesCategory,
} from "@/lib/seo-directory";
import { siteConfig } from "@/lib/site-config";

type PageProps = { params: Promise<{ slug: string }> };

async function getCategoryEntries(slug: string) {
  const category = getServiceCategory(slug);
  if (!category) return { category: null, entries: [] };
  const entries = (
    await getPublicMuaDirectory({ category: category.slug }).catch(() => [])
  ).filter((entry) =>
    entry.services.some((service) => serviceMatchesCategory(service, category)),
  );
  return { category, entries };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category, entries } = await getCategoryEntries(slug).catch(() => ({
    category: null,
    entries: [],
  }));
  if (!category)
    return {
      title: "Service MUA Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  const url = `${siteConfig.url}/service/${category.slug}`;
  const title = `${category.name} Profesional | Harga & Portofolio`;
  const description = `Temukan ${category.name.toLowerCase()} profesional untuk ${category.description}. Lihat harga, area layanan, portofolio, dan booking secara online.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: {
      index: entries.length > 0,
      follow: true,
      googleBot: {
        index: entries.length > 0,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: { title, description, url, locale: "id_ID", type: "website" },
  };
}

export default async function ServiceDirectoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { category, entries } = await getCategoryEntries(slug);
  if (!category || entries.length === 0) notFound();
  const url = `${siteConfig.url}/service/${category.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: category.name,
        description: category.description,
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
            name: "Service",
            item: `${siteConfig.url}/service`,
          },
          { "@type": "ListItem", position: 3, name: category.name, item: url },
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
            <span>{category.name}</span>
          </nav>
          <header className="mt-8 max-w-3xl">
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
              Temukan {category.name} Profesional
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground-dark">
              Pilih makeup artist untuk {category.description}. Lihat profil,
              wilayah pelayanan, harga awal, dan hasil karya sebelum booking.
            </p>
          </header>
          <p className="mt-10 text-sm text-muted-foreground-dark">
            Menampilkan {entries.length} makeup artist.
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
