"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { ImageIcon, Loader2 } from "lucide-react"
import { createPortfolio, deletePendingPortfolioImage } from "../actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionToast } from "@/hooks/use-action-toast"
import ResumableImageUpload from "@/components/ResumableImageUpload"
import { toast } from "@/components/ui/toast"

export default function PortfolioForm() {
  const [state, action, pending] = useActionState(createPortfolio, undefined)
  const [imageUrl, setImageUrl] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [altText, setAltText] = useState("")
  const [removingImage, setRemovingImage] = useState(false)
  useActionToast(state)

  async function removeUploadedImage() {
    if (!imageUrl || removingImage) return false
    setRemovingImage(true)
    try {
      const result = await deletePendingPortfolioImage(imageUrl)
      if (result.error) {
        toast.add({
          title: "Gagal menghapus gambar",
          description: result.error,
          type: "error",
          timeout: 6000,
        })
        return false
      }

      setImageUrl("")
      toast.add({
        title: result.success ?? "Gambar berhasil dihapus.",
        type: "success",
        timeout: 5000,
      })
      return true
    } catch {
      toast.add({
        title: "Gagal menghapus gambar",
        description: "Silakan coba lagi.",
        type: "error",
        timeout: 6000,
      })
      return false
    } finally {
      setRemovingImage(false)
    }
  }

  return (
    <form action={action} noValidate className="space-y-6">
      {state?.error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{state.error}</p>}

      <ResumableImageUpload
        id="image"
        name="imageUrl"
        label="Gambar"
        purpose="portfolio"
        value={imageUrl}
        onChange={setImageUrl}
        required
        disabled={pending || removingImage}
        error={state?.fieldErrors?.imageUrl?.[0]}
        onRemove={removeUploadedImage}
        removeDisabled={removingImage}
        requireRemoveBeforeReplace
      />

      <div className="space-y-2">
        <Label htmlFor="title">
          Judul <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Contoh: Makeup Wedding Tradisional"
          disabled={pending}
          aria-invalid={Boolean(state?.fieldErrors?.title)}
          aria-describedby={state?.fieldErrors?.title ? "title-error" : undefined}
          className="h-11 rounded-xl bg-background px-3 text-base shadow-none touch-manipulation dark:bg-background-dark md:text-sm"
        />
        {state?.fieldErrors?.title && (
          <p id="title-error" className="text-xs text-red-500">
            {state.fieldErrors.title[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-trigger">
          Kategori <span className="text-destructive">*</span>
        </Label>
        <input type="hidden" name="category" value={category} />
        <Select
          value={category}
          onValueChange={(value) => setCategory(value ?? "")}
          disabled={pending}
        >
          <SelectTrigger
            id="category-trigger"
            aria-invalid={Boolean(state?.fieldErrors?.category)}
            aria-describedby={
              state?.fieldErrors?.category ? "category-error" : undefined
            }
            className="h-11 w-full rounded-xl bg-background px-3 text-base shadow-none touch-manipulation dark:bg-background-dark md:text-sm"
          >
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent align="start" className="rounded-xl">
            <SelectItem value="Pertunangan">Pertunangan</SelectItem>
            <SelectItem value="Wisuda">Wisuda</SelectItem>
            <SelectItem value="Photoshoot">Photoshoot</SelectItem>
          </SelectContent>
        </Select>
        {state?.fieldErrors?.category && (
          <p id="category-error" className="text-xs text-red-500">
            {state.fieldErrors.category[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="altText">
          Alt Text (SEO) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="altText"
            name="altText"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            className="h-11 rounded-xl bg-background pl-10 pr-3 text-base shadow-none touch-manipulation dark:bg-background-dark md:text-sm"
            placeholder="Jelaskan isi foto secara singkat"
            disabled={pending}
            aria-invalid={Boolean(state?.fieldErrors?.altText)}
            aria-describedby={
              state?.fieldErrors?.altText ? "alt-text-error" : undefined
            }
          />
        </div>
        {state?.fieldErrors?.altText && (
          <p id="alt-text-error" className="text-xs text-red-500">
            {state.fieldErrors.altText[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
        <Link href="/dashboard/portfolios" className={cn(buttonVariants({ variant: "ghost" }), "h-11 rounded-xl touch-manipulation")}>Batal</Link>
        <Button type="submit" disabled={pending || removingImage || !imageUrl} className="h-11 rounded-xl touch-manipulation">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Portofolio
        </Button>
      </div>
    </form>
  )
}
