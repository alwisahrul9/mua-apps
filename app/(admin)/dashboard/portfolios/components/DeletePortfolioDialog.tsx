"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { deletePortfolio } from "../actions"
import { useRouter } from "next/navigation"

export default function DeletePortfolioDialog({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePortfolio(id)
      if (result?.error) {
        alert(result.error)
        setIsOpen(false)
      } else {
        // Redirect is handled by the server action on success, but just in case:
        router.refresh()
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Hapus Portofolio
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-border rounded-2xl p-6 max-w-md w-full shadow-lg shadow-black/5">
            <h3 className="text-lg font-semibold mb-2">Hapus Portofolio?</h3>
            <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark text-sm mb-6">
              Apakah Anda yakin ingin menghapus portofolio ini? Data dan gambar yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-input bg-transparent hover:bg-accent dark:bg-accent-dark dark:bg-accent dark:bg-accent-dark transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center min-w-[100px]"
              >
                {isPending ? (
                  <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
