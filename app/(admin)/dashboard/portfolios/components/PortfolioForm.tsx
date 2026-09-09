"use client"

import { useActionState, useState, useRef, startTransition } from "react"
import Link from "next/link"
import { UploadCloud, Image as ImageIcon } from "lucide-react"
import * as tus from "tus-js-client"
import { createClient } from "@/utils/supabase/client"
import { createPortfolio } from "../actions"

export default function PortfolioForm() {
  const [state, formAction, isServerPending] = useActionState(createPortfolio, undefined)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const isPending = isServerPending || isUploading

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Ukuran gambar maksimal 5MB")
        e.target.value = ''
        return
      }
      const acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!acceptedTypes.includes(file.type)) {
        setUploadError("Format gambar harus .jpg, .jpeg, .png, atau .webp")
        e.target.value = ''
        return
      }
      setUploadError(null)
      const url = URL.createObjectURL(file)
      setPreviewImage(url)
    } else {
      setPreviewImage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setUploadError(null)
    const formData = new FormData(e.currentTarget)
    const file = formData.get("image") as File

    if (!file || file.size === 0) {
      setUploadError("Gambar wajib diunggah")
      return
    }

    setIsUploading(true)
    setProgress(0)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `images/${fileName}`

      const upload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: 'portfolios',
          objectName: filePath,
          contentType: file.type,
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024,
        onError: function (error) {
          console.error("Upload error:", error)
          setUploadError("Gagal mengunggah gambar: " + error.message)
          setIsUploading(false)
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
          setProgress(Number(percentage))
        },
        onSuccess: function () {
          formData.set("imagePath", filePath)
          
          startTransition(() => {
            formAction(formData)
            setIsUploading(false)
          })
        }
      })

      upload.start()

    } catch (error: any) {
      console.error(error)
      setUploadError(error.message)
      setIsUploading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {(state?.error || uploadError) && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
          {state?.error || uploadError}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Upload Gambar <span className="text-red-500">*</span>
        </label>

        <div className="flex flex-col gap-4">
          <label
            htmlFor="image"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 hover:bg-muted/50 dark:bg-muted-dark/50 dark:bg-muted dark:bg-muted-dark/50 transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : 'border-foreground/20 dark:border-foreground-dark/20 dark:border-foreground dark:border-foreground-dark/20 hover:border-foreground/40 dark:border-foreground-dark/40 dark:border-foreground dark:border-foreground-dark/40'
              }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark" />
              <p className="mb-2 text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark text-center px-4">
                <span className="font-semibold text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark">
                  {previewImage ? "Klik untuk mengganti gambar" : "Klik untuk mengunggah"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">PNG, JPG atau WEBP (Maks. 5MB)</p>
            </div>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleImageChange}
              disabled={isPending}
              className="hidden"
            />
          </label>

          {isPending && progress > 0 && (
            <div className="w-full space-y-2 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                <span>Mengunggah file...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary dark:bg-primary-dark dark:bg-primary dark:bg-primary-dark transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {previewImage && (
            <div>
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="relative rounded-2xl border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 overflow-hidden w-full max-w-[240px] aspect-[3/4] bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        {state?.fieldErrors?.imagePath && (
          <p className="text-xs text-red-500 font-medium mt-2">{state.fieldErrors.imagePath[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium leading-none">
          Judul <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          disabled={isPending}
          placeholder="Contoh: Wedding Mbak Ayu & Mas Budi"
          className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {state?.fieldErrors?.title && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium leading-none">
          Kategori <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          disabled={isPending}
          defaultValue=""
          className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
        >
          <option value="" disabled>Pilih Kategori</option>
          <option value="Pertunangan">Pertunangan</option>
          <option value="Wisuda">Wisuda</option>
          <option value="Photoshoot">Photoshoot</option>
        </select>
        {state?.fieldErrors?.category && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.category[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="altText" className="text-sm font-medium leading-none">
          Alt Text (Pencarian Google) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="altText"
          name="altText"
          disabled={isPending}
          placeholder="Contoh: Makeup Wedding Tradisional Jawa"
          className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {state?.fieldErrors?.altText && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.altText[0]}</p>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
        <Link
          href="/dashboard/portfolios"
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-input bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark hover:bg-accent dark:bg-accent-dark dark:bg-accent dark:bg-accent-dark hover:text-accent-foreground dark:text-accent-foreground-dark dark:text-accent-foreground dark:text-accent-foreground-dark h-11 ${isPending ? "pointer-events-none opacity-50" : ""
            }`}
          aria-disabled={isPending}
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-primary dark:bg-primary-dark dark:bg-primary dark:bg-primary-dark px-4 py-2 text-sm font-medium text-primary-foreground dark:text-primary-foreground-dark dark:text-primary-foreground dark:text-primary-foreground-dark shadow-sm transition-colors hover:bg-primary/90 dark:bg-primary-dark/90 dark:bg-primary dark:bg-primary-dark/90 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan dan Mengunggah...
            </>
          ) : (
            "Simpan Portofolio"
          )}
        </button>
      </div>
    </form>
  )
}
