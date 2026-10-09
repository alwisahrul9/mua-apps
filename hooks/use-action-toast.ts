"use client"

import { useEffect } from "react"
import { toast } from "@/components/ui/toast"

type ActionState = {
  success?: string
  error?: string
  errors?: unknown
  fieldErrors?: unknown
} | null | undefined

export function useActionToast(state: ActionState) {
  useEffect(() => {
    if (state?.success) {
      toast.add({ title: "Berhasil", description: state.success, type: "success", timeout: 5000 })
      return
    }
    if (state?.error) {
      toast.add({ title: "Terjadi kesalahan", description: state.error, type: "error", timeout: 6000 })
      return
    }
    if (state?.errors || state?.fieldErrors) {
      toast.add({ title: "Data belum valid", description: "Periksa kembali field yang ditandai.", type: "error", timeout: 5000 })
    }
  }, [state])
}
