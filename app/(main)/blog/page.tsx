import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { listPublicArticles } from "@/lib/api/public";
import { blogArticles } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `Panduan Makeup dan Bisnis MUA | ${siteConfig.name}` },
  description:
    "Panduan memilih makeup artist, mempersiapkan makeup untuk acara, dan mengelola bisnis MUA secara lebih rapi.",
  alternates: { canonical: `${siteConfig.url}/blog` },
};

export default async function BlogPage() {
  const backendArticles = await listPublicArticles()
    .then((result) => result.data)
    .catch(() => []);
  const articles =
    backendArticles.length > 0
      ? backendArticles.map((article) => ({
          slug: article.slug,
          title: article.title,
          description:
            article.excerpt ||
            article.description ||
            (article.content || "").slice(0, 180),
        }))
      : blogArticles;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-dark pb-24 pt-32 text-foreground-dark">
        <div className="container-custom">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">
              Panduan JadiCantik
            </p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
              Panduan Makeup dan MUA
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground-dark">
              Informasi praktis untuk calon klien dan makeup artist, mulai dari
              memilih layanan hingga mempersiapkan hari acara.
            </p>
          </header>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="rounded-3xl border border-foreground-dark/10 p-7"
              >
                <h2 className="font-serif text-2xl">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="hover:text-primary-dark"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-4 leading-7 text-muted-foreground-dark">
                  {article.description}
                </p>
                <Link
                  href={`/blog/${article.slug}`}
                  className="mt-6 inline-flex items-center gap-2 font-medium text-primary-dark"
                >
                  Baca panduan <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
