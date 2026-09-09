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
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tambah Portofolio Baru</h1>
          <p className="text-muted-foreground mt-1">Unggah gambar karya makeup terbaik Anda.</p>
        </div>
      </div>

      <div className="bg-background border border-foreground/10 p-6 sm:p-8 rounded-2xl shadow-sm">
        {isLimitReached ? (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Batas Portofolio Tercapai</h2>
            <p className="text-muted-foreground">
              Anda telah mencapai batas maksimal 9 portofolio. Silakan hapus beberapa portofolio lama sebelum menambahkan yang baru.
            </p>
            <Link
              href="/dashboard/portfolios"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
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
