import { getService } from "@/lib/api/dashboard"
import { notFound } from "next/navigation"
import { deleteService } from "../actions"
import Link from "next/link"
import { Edit, ArrowLeft } from "lucide-react"
import DeleteServiceDialog from "../components/DeleteServiceDialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const service = await getService(id).catch(() => null)

  if (!service) {
    notFound()
  }

  const deleteServiceWithId = deleteService.bind(null, service.id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center flex-wrap gap-4">
        <Link href="/dashboard/services">
          <button className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-xl h-10 w-10 hover:bg-muted dark:hover:bg-muted-dark" })}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Kembali</span>
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Detail Layanan</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1">Informasi lengkap terkait layanan {service.name}.</p>
        </div>
      </div>

      <Card className="relative overflow-hidden border-foreground/10 dark:border-foreground-dark/10 shadow-sm rounded-2xl">
        <div className="absolute top-4 right-3 sm:top-8 sm:right-8 z-10">
          <DeleteServiceDialog action={deleteServiceWithId} />
        </div>
        <CardContent className="p-5 sm:p-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground-dark mb-2 pr-12 sm:pr-14">
            {service.name}
          </h2>
          <p className="text-2xl font-semibold text-primary dark:text-primary-dark mb-8">
            Rp {service.price.toLocaleString("id-ID")}
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark mb-2">Deskripsi</h3>
              <div className="bg-muted/20 dark:bg-muted-dark/20 p-5 rounded-xl border border-foreground/5 dark:border-foreground-dark/5">
                <p className="text-foreground dark:text-foreground-dark leading-relaxed whitespace-pre-wrap">
                  {service.description || "Tidak ada deskripsi untuk layanan ini."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 dark:bg-muted-dark/30 p-5 sm:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-foreground/5 dark:border-foreground-dark/5">
          <Link href={`/dashboard/services/${service.id}/edit`}>
            <button className={buttonVariants({ variant: "default", size: "lg", className: "w-full sm:w-auto rounded-xl h-11 px-6 shadow-sm" })}>
              <Edit className="h-4 w-4" />
              Edit Layanan
            </button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
