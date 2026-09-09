import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import PortfolioForm from "../components/PortfolioForm"

export default async function CreatePortfolioPage() {
  const count = await prisma.portfolio.count()
  const isLimitReached = count >= 9

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/portfolios"
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Tambah Portofolio Baru</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1">Unggah gambar karya makeup terbaik Anda.</p>
        </div>
      </div>

      <div className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 p-6 sm:p-8 rounded-2xl shadow-sm">
        {isLimitReached ? (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Batas Portofolio Tercapai</h2>
            <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
              Anda telah mencapai batas maksimal 9 portofolio. Silakan hapus beberapa portofolio lama sebelum menambahkan yang baru.
            </p>
            <Link
              href="/dashboard/portfolios"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary dark:bg-primary-dark dark:bg-primary dark:bg-primary-dark px-4 py-2 text-sm font-medium text-primary-foreground dark:text-primary-foreground-dark dark:text-primary-foreground dark:text-primary-foreground-dark shadow-sm transition-colors hover:bg-primary/90 dark:bg-primary-dark/90 dark:bg-primary dark:bg-primary-dark/90"
            >
              Kembali ke Galeri
            </Link>
          </div>
        ) : (
          <PortfolioForm />
        )}
      </div>
    </div>
  )
}
