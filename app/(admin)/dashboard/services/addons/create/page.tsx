import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { listAllServices } from "@/lib/api/dashboard"
import AddOnForm from "./AddOnForm"

export default async function CreateAddOnPage() {
  const services = await listAllServices()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Link
          href="/dashboard/services?tab=add-ons"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-muted-dark"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali ke daftar add-on</span>
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
            Tambah Add-on Baru
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base dark:text-muted-foreground-dark">
            Atur harga, satuan, dan layanan yang dapat menggunakan add-on.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm sm:p-8 dark:border-foreground-dark/10 dark:bg-background-dark">
        <AddOnForm services={services} />
      </div>
    </div>
  )
}
