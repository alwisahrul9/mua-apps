import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Image from "next/image"

export default async function PortfoliosPage() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { createdAt: "desc" },
    take: 9,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-foreground">Portofolio</h1>
          <p className="text-muted-foreground mt-1">Kelola galeri hasil karya dan portofolio Anda.</p>
        </div>
        <Link
          href="/dashboard/portfolios/create"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Portofolio
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Belum ada portofolio yang ditambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {portfolios.map((portfolio: any) => (
            <Link href={`/dashboard/portfolios/${portfolio.id}`} key={portfolio.id} className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm transition-all hover:shadow-md block cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image
                  src={portfolio.imageUrl}
                  alt={portfolio.altText}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-md mb-2">
                  {portfolio.category}
                </span>
                <h3 className="text-white font-medium truncate">{portfolio.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
