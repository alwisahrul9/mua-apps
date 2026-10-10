import Link from "next/link"
import { Plus } from "lucide-react"
import { listPortfolios } from "@/lib/api/dashboard"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { publicMediaUrl } from "@/lib/media-url"

export default async function PortfoliosPage() {
  const portfolios = (await listPortfolios()).slice(0, 9)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex-1 min-w-[240px]">
          <h1 className="text-2xl font-serif tracking-tight text-foreground dark:text-foreground-dark">Portofolio</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">Kelola galeri hasil karya dan portofolio Anda.</p>
        </div>
        <Link
          href="/dashboard/portfolios/create"
          className={cn(
            buttonVariants({ variant: "default" }),
            "ml-auto shrink-0 rounded-xl bg-primary dark:bg-primary-dark px-4 py-2 text-sm font-medium text-primary-foreground dark:text-primary-foreground-dark shadow-sm hover:bg-primary/90 dark:hover:bg-primary-dark/90"
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Portofolio
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <Card className="text-center py-12 border-2 border-dashed border-border rounded-xl shadow-none">
          <p className="text-muted-foreground dark:text-muted-foreground-dark">Belum ada portofolio yang ditambahkan.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Link href={`/dashboard/portfolios/${portfolio.id}`} key={portfolio.id} className="group relative block cursor-pointer">
              <Card className="relative overflow-hidden rounded-2xl border-foreground/10 dark:border-foreground-dark/10 bg-background dark:bg-background-dark shadow-sm transition-all hover:shadow-md h-full aspect-[3/4]">
                <Image
                  src={publicMediaUrl(portfolio.imageUrl)}
                  alt={portfolio.altText}
                  width={500}
                  height={500}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none">
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-0 font-medium mb-2">
                    {portfolio.category}
                  </Badge>
                  <h3 className="text-white font-medium truncate">{portfolio.title}</h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
