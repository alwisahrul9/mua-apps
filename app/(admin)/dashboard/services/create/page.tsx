import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ServiceForm from "../components/ServiceForm"

export default function CreateServicePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Tambah Layanan Baru</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1">Isi formulir di bawah ini untuk menambahkan layanan.</p>
        </div>
      </div>

      <div className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 p-6 sm:p-8 rounded-2xl shadow-sm">
        <ServiceForm actionType="create" />
      </div>
    </div>
  )
}
