"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { deletePortfolio } from "../actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
export default function DeletePortfolioDialog({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePortfolio(id)
      if (result?.error) {
        toast.add({ title: "Gagal menghapus portofolio", description: result.error, type: "error", timeout: 6000 })
        setIsOpen(false)
      } else {
        // Redirect is handled by the server action on success, but just in case:
        router.refresh()
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            className={buttonVariants({
              variant: "outline",
              className: "w-full sm:w-auto inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white h-11 px-6 shadow-sm",
            })}
          />
        }
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Hapus
      </AlertDialogTrigger>
      
      <AlertDialogContent className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark rounded-2xl p-6 w-[90%] max-w-md shadow-xl border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark mb-2">
            Konfirmasi Hapus
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mb-6">
            Apakah Anda yakin ingin menghapus portofolio ini? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-end gap-3 mt-4 sm:space-x-0">
          <AlertDialogCancel
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark hover:bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark h-10 px-4 disabled:opacity-50 border-0 shadow-none mt-0"
          >
            Batal
          </AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={isPending}
            className={buttonVariants({
              variant: "destructive",
              className: "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors h-10 px-4 shadow-sm min-w-[100px] disabled:opacity-50",
            })}
          >
            {isPending ? (
              <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              "Ya, Hapus"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
