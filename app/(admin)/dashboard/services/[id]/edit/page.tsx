import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import ServiceForm from "../../components/ServiceForm"

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const service = await prisma.service.findUnique({
    where: { id },
  })

  if (!service) {
    notFound()
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Layanan</h1>
          <p className="text-muted-foreground mt-1">Perbarui informasi layanan di bawah ini.</p>
        </div>
      </div>

      <div className="bg-background border border-foreground/10 p-6 sm:p-8 rounded-2xl shadow-sm">
        <ServiceForm service={service} actionType="update" />
      </div>
    </div>
  )
}
