import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, MoreVertical } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Layanan</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1">Kelola daftar layanan dan harga yang Anda tawarkan.</p>
        </div>
        <Link
          href="/dashboard/services/create"
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary dark:bg-primary-dark dark:bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark dark:text-primary-foreground dark:text-primary-foreground-dark hover:bg-primary/90 dark:bg-primary-dark/90 dark:bg-primary dark:bg-primary-dark/90 h-11 px-8 gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Layanan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <div className="col-span-full bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mb-4">Belum ada layanan yang ditambahkan.</p>
          </div>
        ) : (
          services.map((service) => (
            <Link
              key={service.id}
              href={`/dashboard/services/${service.id}`}
              className="group bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 p-5 rounded-2xl shadow-sm hover:border-primary/30 dark:border-primary-dark/30 dark:border-primary dark:border-primary-dark/30 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <h3 className="font-semibold text-lg text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark group-hover:text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark transition-colors line-clamp-1">{service.name}</h3>
                <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark text-sm line-clamp-2 mt-1">
                  {service.description || "Tidak ada deskripsi."}
                </p>
              </div>
              <div className="pt-4 border-t border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5 mt-4 flex items-center justify-between">
                <p className="font-medium text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">
                  Rp {service.price.toLocaleString("id-ID")}
                </p>
                <div className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark opacity-50 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs">Lihat Detail &rarr;</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
