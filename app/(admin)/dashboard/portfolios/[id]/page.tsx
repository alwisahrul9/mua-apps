import { getPortfolio } from "@/lib/api/dashboard"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Tag, Type } from "lucide-react"
import DeletePortfolioDialog from "../components/DeletePortfolioDialog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const portfolio = await getPortfolio(id).catch(() => null)

  if (!portfolio) {
    notFound()
  }

  // Format tanggal
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(portfolio.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/portfolios"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-10 w-10 rounded-xl bg-background hover:bg-muted dark:bg-background-dark dark:hover:bg-muted-dark border-input shadow-sm"
            )}
          >
            <ArrowLeft className="h-5 w-5 dark:text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-foreground dark:text-foreground-dark">Detail Portofolio</h1>
            <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">Informasi lengkap terkait karya portofolio Anda.</p>
          </div>
        </div>
        <DeletePortfolioDialog id={portfolio.id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Kolom Gambar (Lebih Besar) */}
        <Card className="md:col-span-7 bg-background dark:bg-background-dark border-foreground/10 dark:border-foreground-dark/10 rounded-3xl p-2 shadow-sm overflow-hidden flex items-center justify-center h-fit">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted dark:bg-muted-dark">
            <Image
              src={portfolio.imageUrl}
              alt={portfolio.altText}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </Card>

        {/* Kolom Detail */}
        <Card className="md:col-span-5 bg-background dark:bg-background-dark border-foreground/10 dark:border-foreground-dark/10 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2 text-foreground dark:text-foreground-dark">Informasi Portofolio</h2>

            <div className="space-y-5">
              <div>
                <span className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark mb-1">
                  <Type className="w-4 h-4" /> Judul
                </span>
                <p className="font-medium text-foreground dark:text-foreground-dark text-lg">{portfolio.title}</p>
              </div>

              <div>
                <span className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark mb-1">
                  <Tag className="w-4 h-4" /> Kategori
                </span>
                <Badge variant="secondary" className="px-3 py-1 bg-primary dark:bg-primary-dark/5 text-white dark:text-primary-dark font-medium rounded-full hover:bg-primary/20 dark:hover:bg-primary-dark/20 border-0">
                  {portfolio.category}
                </Badge>
              </div>

              <div>
                <span className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark mb-1">
                  <Type className="w-4 h-4" /> Alt Text (SEO)
                </span>
                <p className="text-foreground dark:text-foreground-dark">{portfolio.altText}</p>
              </div>

              <div>
                <span className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark mb-1">
                  <Calendar className="w-4 h-4" /> Diunggah Pada
                </span>
                <p className="text-foreground dark:text-foreground-dark">{formattedDate}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
