import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { deleteService } from "../actions"
import Link from "next/link"
import { Trash2, Edit, ArrowLeft } from "lucide-react"
import DeleteButton from "./delete-button"

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const service = await prisma.service.findUnique({
    where: { id },
  })

  if (!service) {
    notFound()
  }

  const deleteServiceWithId = deleteService.bind(null, service.id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Detail Layanan</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1">Informasi lengkap terkait layanan {service.name}.</p>
        </div>
      </div>

      <div className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark mb-2">
            {service.name}
          </h2>
          <p className="text-2xl font-semibold text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark mb-8">
            Rp {service.price.toLocaleString("id-ID")}
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mb-2">Deskripsi</h3>
              <div className="bg-muted/20 dark:bg-muted-dark/20 dark:bg-muted dark:bg-muted-dark/20 p-5 rounded-xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                <p className="text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark leading-relaxed whitespace-pre-wrap">
                  {service.description || "Tidak ada deskripsi untuk layanan ini."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
          <DeleteButton action={deleteServiceWithId} />
          <Link
            href={`/dashboard/services/${service.id}/edit`}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary dark:bg-primary-dark dark:bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark dark:text-primary-foreground dark:text-primary-foreground-dark hover:bg-primary/90 dark:bg-primary-dark/90 dark:bg-primary dark:bg-primary-dark/90 h-11 px-6 shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Layanan
          </Link>
        </div>
      </div>
    </div>
  )
}
