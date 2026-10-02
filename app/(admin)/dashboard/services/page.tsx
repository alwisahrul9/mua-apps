import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl font-serif tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Layanan</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1 text-sm sm:text-base">Kelola daftar layanan dan harga yang Anda tawarkan.</p>
        </div>
        <Button className="ml-auto h-10 px-5 text-xs sm:h-11 sm:px-8 sm:text-sm shadow-sm shrink-0 rounded-xl">
          <Link href="/dashboard/services/create" className="flex items-center gap-1.5 sm:gap-2">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Tambah Layanan
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <Card className="col-span-full border-foreground/10 dark:border-foreground-dark/10 shadow-sm rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center text-center p-8">
              <p className="text-muted-foreground dark:text-muted-foreground-dark mb-4">Belum ada layanan yang ditambahkan.</p>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Link key={service.id} href={`/dashboard/services/${service.id}`} className="group cursor-pointer">
              <Card className="h-full flex flex-col justify-between border-primary dark:border-primary-dark p-1 rounded-2xl shadow-sm hover:border-primary/80 dark:hover:border-primary-dark/80 hover:shadow-md transition-all">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">{service.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {service.description || "Tidak ada deskripsi."}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-4 pt-4 border-t border-primary/20 dark:border-primary-dark/20 mt-4 flex items-center justify-between">
                  <p className="font-medium text-foreground dark:text-foreground-dark">
                    Rp {service.price.toLocaleString("id-ID")}
                  </p>
                  <div className="text-muted-foreground dark:text-muted-foreground-dark opacity-50 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs">Lihat Detail &rarr;</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
