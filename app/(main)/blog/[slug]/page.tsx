import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getPublicArticle } from "@/lib/api/public";
import type { Article } from "@/lib/api/types";
import { blogArticles, getBlogArticle } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";

type PageProps = { params: Promise<{ slug: string }> };
type FallbackArticle = ReturnType<typeof getBlogArticle>;

export function generateStaticParams() {
  return blogArticles.map(({ slug }) => ({ slug }));
}

async function resolveArticle(
  slug: string,
): Promise<{ article: Article | null; fallback: FallbackArticle }> {
  const article = await getPublicArticle(slug).catch(() => null);
  return { article, fallback: article ? undefined : getBlogArticle(slug) };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { article, fallback } = await resolveArticle((await params).slug);
  if (!article && !fallback)
    return {
      title: "Artikel Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  const slug = article?.slug ?? fallback!.slug;
  const title = article?.title ?? fallback!.title;
  const description =
    article?.excerpt || article?.description || fallback!.description;
  const publishedAt =
    article?.publishedAt || article?.createdAt || fallback!.publishedAt;
  const updatedAt = article?.updatedAt || fallback!.updatedAt;
  const url = `${siteConfig.url}/blog/${slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "id_ID",
      publishedTime: publishedAt,
      modifiedTime: updatedAt,
      images: article?.imageUrl ? [article.imageUrl] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { article, fallback } = await resolveArticle((await params).slug);
  if (!article && !fallback) notFound();
  const slug = article?.slug ?? fallback!.slug;
  const title = article?.title ?? fallback!.title;
  const description =
    article?.excerpt || article?.description || fallback!.description;
  const publishedAt =
    article?.publishedAt || article?.createdAt || fallback!.publishedAt;
  const updatedAt = article?.updatedAt || fallback!.updatedAt;
  const url = `${siteConfig.url}/blog/${slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt,
    image: article?.imageUrl || undefined,
    inLanguage: "id-ID",
    mainEntityOfPage: url,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/icon.png` },
    },
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
        <article className="container-custom max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="text-sm text-muted-foreground-dark"
          >
            <Link href="/">Beranda</Link> / <Link href="/blog">Panduan</Link>
          </nav>
          <header className="mt-8">
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground-dark">
              {description}
            </p>
          </header>
          {article ? (
            <div className="mt-12 whitespace-pre-wrap text-base leading-8 text-muted-foreground-dark">
              {article.content}
            </div>
          ) : (
            <div className="mt-12 space-y-12">
              {fallback!.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-serif text-3xl">{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-4 leading-8 text-muted-foreground-dark"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.tips && (
                    <ul className="mt-5 list-disc space-y-3 pl-6 text-muted-foreground-dark">
                      {section.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
          <aside className="mt-14 rounded-3xl bg-primary-dark/10 p-7">
            <h2 className="font-serif text-2xl">
              Temukan MUA untuk acara Anda
            </h2>
            <p className="mt-3 text-muted-foreground-dark">
              Lihat profil, layanan, wilayah pelayanan, harga awal, dan
              portofolio makeup artist di JadiCantik.
            </p>
            <Link
              href="/service/wisuda"
              className="mt-5 inline-flex rounded-full bg-foreground-dark px-6 py-3 font-medium text-background-dark"
            >
              Cari Makeup Artist
            </Link>
          </aside>
        </article>
      </main>
    </>
  );
}
