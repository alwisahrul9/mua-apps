import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { getPublicMuaDirectory, serviceCategories, serviceMatchesCategory } from "@/lib/seo-directory"
import { siteConfig } from "@/lib/site-config"
import { getSeoDirectory } from "@/lib/api/public"

export const metadata: Metadata = {
  title: { absolute: `Cari MUA Berdasarkan Service | ${siteConfig.name}` },
  description: "Cari makeup artist untuk wisuda, wedding, lamaran, pesta, dan photoshoot. Bandingkan profil, wilayah, portofolio, serta harga.",
  alternates: { canonical: `${siteConfig.url}/service` },
}

export default async function ServiceIndexPage() {
  const [entries, seoDirectory] = await Promise.all([
    getPublicMuaDirectory().catch(() => []),
    getSeoDirectory().catch(() => ({ cities: [], categories: [] })),
  ])
  const backendCounts = new Map(seoDirectory.categories.map((item) => [item.slug, item.count]))
  const categories = serviceCategories.map((category) => ({
    ...category,
    count: backendCounts.get(category.slug) ?? entries.filter((entry) => entry.services.some((service) => serviceMatchesCategory(service, category))).length,
  })).filter((category) => category.count > 0)
  return <><Navbar /><main className="min-h-screen bg-background pb-24 pt-32 text-foreground"><div className="container-custom"><header className="max-w-3xl"><h1 className="font-serif text-4xl sm:text-5xl">Cari MUA Berdasarkan Service</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">Pilih kebutuhan makeup Anda dan temukan MUA dengan service serta portofolio yang relevan.</p></header>{categories.length > 0 ? <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category.slug} href={`/service/${category.slug}`} className="rounded-2xl border border-foreground/10 p-6 transition hover:border-primary/50"><Sparkles className="h-6 w-6 text-primary" /><strong className="mt-4 block text-lg">{category.name}</strong><p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p><small className="mt-4 block text-primary">{category.count} makeup artist</small></Link>)}</div> : <p className="mt-12 rounded-2xl border border-dashed border-foreground/20 p-8 text-muted-foreground">Direktori service sedang dipersiapkan.</p>}</div></main></>
}
