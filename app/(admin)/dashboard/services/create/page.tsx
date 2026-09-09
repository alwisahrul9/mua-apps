import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ServiceForm from "../components/ServiceForm"

export default function CreateServicePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tambah Layanan Baru</h1>
          <p className="text-muted-foreground mt-1">Isi formulir di bawah ini untuk menambahkan layanan.</p>
        </div>
      </div>

      <div className="bg-background border border-foreground/10 p-6 sm:p-8 rounded-2xl shadow-sm">
        <ServiceForm actionType="create" />
      </div>
    </div>
  )
}
