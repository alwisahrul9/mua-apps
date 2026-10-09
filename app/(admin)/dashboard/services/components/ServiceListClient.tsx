"use client"

import { useCallback, useRef, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import type { Service } from "@/lib/api/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServicesPage } from "../actions"

type ServiceListClientProps = {
  initialServices: Service[]
  initialPage: number
  initialLastPage: number
}

export default function ServiceListClient({
  initialServices,
  initialPage,
  initialLastPage,
}: ServiceListClientProps) {
  const [services, setServices] = useState(initialServices)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(initialPage < initialLastPage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const loadMoreServices = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)
    const result = await getServicesPage(page + 1)

    if (result.error) {
      setError(result.error)
    } else {
      setServices((current) => {
        const existingIds = new Set(current.map((service) => service.id))
        return [
          ...current,
          ...result.data.filter((service) => !existingIds.has(service.id)),
        ]
      })
      setPage(result.currentPage)
      setHasMore(result.currentPage < result.lastPage)
    }
    setLoading(false)
  }, [hasMore, loading, page])

  const lastServiceRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      observer.current?.disconnect()
      if (!node || loading || !hasMore || error) return

      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) void loadMoreServices()
        },
        { rootMargin: "200px 0px" },
      )
      observer.current.observe(node)
    },
    [error, hasMore, loadMoreServices, loading],
  )

  if (services.length === 0) {
    return (
      <Card className="border-foreground/10 shadow-sm rounded-2xl dark:border-foreground-dark/10">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground dark:text-muted-foreground-dark">
            Belum ada layanan yang ditambahkan.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Link
            key={service.id}
            ref={index === services.length - 1 ? lastServiceRef : null}
            href={`/dashboard/services/${service.id}`}
            className="group cursor-pointer"
          >
            <Card className="h-full flex flex-col justify-between border-primary dark:border-primary-dark p-1 rounded-2xl shadow-sm hover:border-primary/80 dark:hover:border-primary-dark/80 hover:shadow-md transition-all">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                  {service.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {service.description || "Tidak ada deskripsi."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-4 border-t border-primary/20 dark:border-primary-dark/20 mt-4 flex items-center justify-between">
                <p className="font-medium text-foreground dark:text-foreground-dark">
                  Rp {service.price.toLocaleString("id-ID")}
                </p>
                <span className="text-xs text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 dark:text-muted-foreground-dark">
                  Lihat Detail &rarr;
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center p-6" role="status">
          <Loader2 className="h-7 w-7 animate-spin text-primary dark:text-primary-dark" />
          <span className="sr-only">Memuat layanan berikutnya...</span>
        </div>
      )}

      {error && (
        <div className="space-y-3 py-4 text-center">
          <p role="alert" className="text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => void loadMoreServices()}
            className="text-sm font-medium text-primary hover:underline dark:text-primary-dark"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!hasMore && !loading && (
        <p className="pb-24 pt-4 text-center text-sm text-muted-foreground md:pb-6 dark:text-muted-foreground-dark">
          Semua layanan telah ditampilkan.
        </p>
      )}
    </div>
  )
}
