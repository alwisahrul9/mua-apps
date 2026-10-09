import { listServices } from "@/lib/api/dashboard"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import ServiceListClient from "./components/ServiceListClient"

export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  const initialResult = await listServices()

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

      <ServiceListClient
        initialServices={initialResult.data}
        initialPage={initialResult.currentPage ?? 1}
        initialLastPage={initialResult.lastPage ?? 1}
      />
    </div>
  )
}
