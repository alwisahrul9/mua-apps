import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Tag, Type } from "lucide-react"
import DeletePortfolioDialog from "../components/DeletePortfolioDialog"

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const portfolio = await prisma.portfolio.findUnique({
    where: { id }
  })

  if (!portfolio) {
    notFound()
  }

  // Format tanggal
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(portfolio.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/portfolios"
            className="inline-flex items-center justify-center p-2 rounded-xl bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-input shadow-sm transition-colors hover:bg-accent dark:bg-accent-dark dark:bg-accent dark:bg-accent-dark hover:text-accent-foreground dark:text-accent-foreground-dark dark:text-accent-foreground dark:text-accent-foreground-dark"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Detail Portofolio</h1>
            <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1">Informasi lengkap terkait karya portofolio Anda.</p>
          </div>
        </div>
        <DeletePortfolioDialog id={portfolio.id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Kolom Gambar (Lebih Besar) */}
        <div className="md:col-span-7 bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 rounded-3xl p-2 shadow-sm overflow-hidden flex items-center justify-center h-fit">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark">
            <Image
              src={portfolio.imageUrl}
              alt={portfolio.altText}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        {/* Kolom Detail */}
        <div className="md:col-span-5 bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Informasi Portofolio</h2>
            
            <div className="space-y-5">
              <div>
                <span className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mb-1">
                  <Type className="w-4 h-4" /> Judul
                </span>
                <p className="font-medium text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark text-lg">{portfolio.title}</p>
              </div>
              
              <div>
                <span className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mb-1">
                  <Tag className="w-4 h-4" /> Kategori
                </span>
                <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-primary-dark/10 dark:bg-primary dark:bg-primary-dark/10 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark text-sm font-medium rounded-full">
                  {portfolio.category}
                </span>
              </div>
              
              <div>
                <span className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mb-1">
                  <Type className="w-4 h-4" /> Alt Text (SEO)
                </span>
                <p className="text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">{portfolio.altText}</p>
              </div>
              
              <div>
                <span className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mb-1">
                  <Calendar className="w-4 h-4" /> Diunggah Pada
                </span>
                <p className="text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
