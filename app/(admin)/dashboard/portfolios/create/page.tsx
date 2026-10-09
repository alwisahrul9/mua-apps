import { listPortfolios } from "@/lib/api/dashboard"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import PortfolioForm from "../components/PortfolioForm"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function CreatePortfolioPage() {
  const count = (await listPortfolios()).length
  const isLimitReached = count >= 9

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/portfolios"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-10 w-10 rounded-xl bg-background hover:bg-muted dark:bg-background-dark dark:hover:bg-muted-dark border-input shadow-sm"
          )}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark">Tambah Portofolio Baru</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">Unggah gambar karya makeup terbaik Anda.</p>
        </div>
      </div>

      <Card className="p-6 sm:p-8 rounded-2xl shadow-sm border-foreground/10 dark:border-foreground-dark/10 bg-background dark:bg-background-dark">
        {isLimitReached ? (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground dark:text-foreground-dark">Batas Portofolio Tercapai</h2>
            <p className="text-muted-foreground dark:text-muted-foreground-dark">
              Anda telah mencapai batas maksimal 9 portofolio. Silakan hapus beberapa portofolio lama sebelum menambahkan yang baru.
            </p>
            <Link
              href="/dashboard/portfolios"
              className={cn(
                buttonVariants({ variant: "default" }),
                "mt-4 rounded-xl bg-primary dark:bg-primary-dark px-4 py-2 text-sm font-medium text-primary-foreground dark:text-primary-foreground-dark shadow-sm hover:bg-primary/90 dark:hover:bg-primary-dark/90"
              )}
            >
              Kembali ke Galeri
            </Link>
          </div>
        ) : (
          <PortfolioForm />
        )}
      </Card>
    </div>
  )
}
