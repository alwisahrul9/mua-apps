import { listServices } from "@/lib/api/dashboard"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import ServiceListClient from "./components/ServiceListClient"
import ServicesTabsClient from "./components/ServicesTabsClient"

export const dynamic = "force-dynamic"

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams
  const initialResult = await listServices()

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">Layanan</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1 text-sm sm:text-base">Kelola layanan utama dan add-on yang Anda tawarkan.</p>
        </div>
      </div>

      <ServicesTabsClient
        initialTab={tab === "add-ons" ? "add-ons" : "services"}
        serviceContent={
          <>
            {initialResult.data.length > 0 && (
              <div className="flex justify-end">
                <Button
                  render={<Link href="/dashboard/services/create" />}
                  nativeButton={false}
                  className="h-10 shrink-0 rounded-xl px-4 text-xs shadow-sm sm:h-11 sm:px-6 sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Tambah Layanan
                </Button>
              </div>
            )}
            <ServiceListClient
              initialServices={initialResult.data}
              initialPage={initialResult.currentPage ?? 1}
              initialLastPage={initialResult.lastPage ?? 1}
            />
          </>
        }
      />
    </div>
  )
}
