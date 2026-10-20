import type { Metadata } from "next"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { getPublicMuaDirectory, toSeoSlug } from "@/lib/seo-directory"
import { getSeoDirectory } from "@/lib/api/public"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: { absolute: `Cari MUA Berdasarkan Area | ${siteConfig.name}` },
  description: "Temukan makeup artist berdasarkan area dan wilayah pelayanan. Lihat profil, service, harga awal, serta portofolio MUA.",
  alternates: { canonical: `${siteConfig.url}/area` },
}

export default async function CityIndexPage() {
  const [entries, seoDirectory] = await Promise.all([
    getPublicMuaDirectory().catch(() => []),
    getSeoDirectory().catch(() => ({ cities: [], categories: [] })),
  ])
  const cities = new Map<string, { name: string; count: number }>()
  for (const { profile } of entries) for (const area of profile.serviceArea ?? []) {
    const slug = toSeoSlug(area)
    if (!slug) continue
    const current = cities.get(slug)
    cities.set(slug, { name: current?.name ?? area, count: (current?.count ?? 0) + 1 })
  }
  for (const city of seoDirectory.cities) {
    const current = cities.get(city.slug)
    cities.set(city.slug, {
      name: city.name,
      count: city.count ?? current?.count ?? 0,
    })
  }

  return <><Navbar /><main className="min-h-screen bg-background-dark pb-24 pt-32 text-foreground-dark"><div className="container-custom"><header className="max-w-3xl"><h1 className="font-serif text-4xl sm:text-5xl">Cari MUA Berdasarkan Area</h1><p className="mt-5 text-lg leading-8 text-muted-foreground-dark">Pilih wilayah untuk melihat makeup artist yang melayani area Anda, lalu bandingkan service, portofolio, dan harga awalnya.</p></header>{cities.size > 0 ? <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...cities.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, "id")).map(([slug, city]) => <Link key={slug} href={`/area/${slug}`} className="flex items-center gap-4 rounded-2xl border border-foreground-dark/10 p-6 transition hover:border-primary-dark/50"><MapPin className="h-6 w-6 text-primary-dark" /><span><strong className="block">MUA {city.name}</strong><small className="text-muted-foreground-dark">{city.count} makeup artist</small></span></Link>)}</div> : <p className="mt-12 rounded-2xl border border-dashed border-foreground-dark/20 p-8 text-muted-foreground-dark">Direktori area sedang dipersiapkan.</p>}</div></main></>
}
