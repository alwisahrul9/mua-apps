"use client"

import { useEffect, useRef, useState } from "react"
import { Images, Loader2, Plus, Trash2 } from "lucide-react"
import ResumableImageUpload from "@/components/ResumableImageUpload"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { publicMediaUrl } from "@/lib/media-url"
import { deleteBrandImage } from "./actions"

const MAX_BRANDS = 10

export default function SupportedBrandsGallery({
  value,
  onChange,
  disabled = false,
  error,
  onUploadingChange,
  username,
}: {
  value: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
  error?: string
  onUploadingChange?: (uploading: boolean) => void
  username: string
}) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removingUrl, setRemovingUrl] = useState<string | null>(null)
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  function handleUploadingChange(nextUploading: boolean) {
    setUploading(nextUploading)
    onUploadingChange?.(nextUploading)
  }

  function addBrand(url: string) {
    const currentValue = valueRef.current
    if (currentValue.length >= MAX_BRANDS) {
      toast.add({
        title: "Galeri brand sudah penuh",
        description: `Maksimal ${MAX_BRANDS} gambar brand per MUA.`,
        type: "error",
        timeout: 5000,
      })
      return
    }
    if (currentValue.includes(url)) return
    const nextValue = [...currentValue, url]
    valueRef.current = nextValue
    onChange(nextValue)
  }

  async function removeBrand(index: number) {
    if (uploading || removingUrl) return
    const removedUrl = valueRef.current[index]
    if (!removedUrl) return
    setRemovingUrl(removedUrl)
    onUploadingChange?.(true)
    try {
      const result = await deleteBrandImage(removedUrl, username)
      if (result.error || !result.supportedBrands) {
        toast.add({
          title: "Gagal menghapus gambar brand",
          description: result.error ?? "Daftar brand terbaru tidak tersedia.",
          type: "error",
          timeout: 6000,
        })
        return
      }
      valueRef.current = result.supportedBrands
      onChange(result.supportedBrands)
      toast.add({
        title: result.success ?? "Gambar brand berhasil dihapus.",
        type: "success",
        timeout: 5000,
      })
    } catch {
      toast.add({
        title: "Gagal menghapus gambar brand",
        description: "Silakan coba lagi.",
        type: "error",
        timeout: 6000,
      })
    } finally {
      setRemovingUrl(null)
      onUploadingChange?.(false)
    }
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <Label>Brand pendukung</Label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="w-full rounded-2xl border border-foreground/10 bg-muted/30 p-4 text-left transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-foreground-dark/10 dark:bg-muted-dark/30 dark:hover:border-primary-dark/40"
      >
        <span className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
              <Images className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-medium">Kelola galeri brand</span>
              <span className="mt-0.5 block text-xs text-muted-foreground dark:text-muted-foreground-dark">
                {value.length} dari {MAX_BRANDS} gambar · maksimal 5 MB per gambar
              </span>
            </span>
          </span>
          <Plus className="h-5 w-5 shrink-0 text-muted-foreground" />
        </span>

        {value.length > 0 && (
          <>
            <span className="mt-4 grid grid-cols-4 gap-2 sm:hidden">
              {value.slice(-4).map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${url}-mobile-${index}`}
                  src={publicMediaUrl(url)}
                  alt={`Brand pendukung terbaru ${index + 1}`}
                  className="aspect-square w-full rounded-lg border border-foreground/10 bg-white object-contain p-1 dark:border-foreground-dark/10"
                />
              ))}
            </span>
            {value.length > 4 && (
              <span className="mt-2 block text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark sm:hidden">
                +{value.length - 4} gambar lainnya
              </span>
            )}
            <span className="mt-4 hidden grid-cols-10 gap-2 sm:grid">
              {value.map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${url}-desktop-${index}`}
                  src={publicMediaUrl(url)}
                  alt={`Brand pendukung ${index + 1}`}
                  className="aspect-square w-full rounded-lg border border-foreground/10 bg-white object-contain p-1 dark:border-foreground-dark/10"
                />
              ))}
            </span>
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!uploading && !removingUrl) setOpen(nextOpen)
        }}
      >
        <DialogContent className="flex h-[calc(100dvh-1.5rem)] max-w-3xl flex-col overflow-hidden rounded-3xl p-5 sm:h-[min(90dvh,44rem)] sm:p-7">
          <DialogHeader className="shrink-0 pr-10">
            <DialogTitle className="font-serif text-xl">Galeri Brand Pendukung</DialogTitle>
            <DialogDescription>
              Tambahkan maksimal {MAX_BRANDS} logo atau gambar brand. Setiap file
              harus berupa JPG, PNG, atau WEBP dengan ukuran maksimal 5 MB.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            {value.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {value.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-foreground/10 bg-white dark:border-foreground-dark/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publicMediaUrl(url)}
                      alt={`Brand pendukung ${index + 1}`}
                      className="h-full w-full object-contain p-3"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => void removeBrand(index)}
                      disabled={disabled || uploading || Boolean(removingUrl)}
                      className="absolute right-2 top-2 rounded-full shadow-sm"
                    >
                      {removingUrl === url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Hapus brand {index + 1}</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-foreground/15 p-8 text-center dark:border-foreground-dark/15">
                <Images className="mx-auto h-9 w-9 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Belum ada gambar brand</p>
                <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground-dark">
                  Unggah gambar pertama melalui bagian di bawah.
                </p>
              </div>
            )}
          </div>

          {value.length < MAX_BRANDS && (
            <div className="shrink-0 border-t border-foreground/10 pt-5 dark:border-foreground-dark/10">
              <ResumableImageUpload
                id="supportedBrandImage"
                name="supportedBrandImageUrl"
                label="Tambah gambar brand"
                purpose="brand"
                value=""
                onChange={addBrand}
                disabled={disabled || Boolean(removingUrl)}
                onUploadingChange={handleUploadingChange}
                multiple
                maxFiles={MAX_BRANDS - value.length}
              />
            </div>
          )}

          {value.length >= MAX_BRANDS && (
            <p className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
              Batas maksimal {MAX_BRANDS} gambar sudah tercapai. Hapus salah satu
              gambar untuk menambahkan yang baru.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
