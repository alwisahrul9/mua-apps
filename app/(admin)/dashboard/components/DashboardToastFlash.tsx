"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/toast"

export default function DashboardToastFlash() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get("toast")
    if (!message) return

    const type = searchParams.get("toastType") === "error" ? "error" : "success"
    toast.add({
      title: type === "success" ? "Berhasil" : "Terjadi kesalahan",
      description: message,
      type,
      timeout: 5000,
    })
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete("toast")
    nextParams.delete("toastType")
    router.replace(`${pathname}${nextParams.size ? `?${nextParams}` : ""}`, { scroll: false })
  }, [pathname, router, searchParams])

  return null
}
