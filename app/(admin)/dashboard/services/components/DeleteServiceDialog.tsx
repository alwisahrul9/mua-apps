"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
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

export default function DeleteServiceDialog({ action }: { action: () => Promise<{ error?: string } | void> }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await action()
      if (result?.error) {
        toast.add({ title: "Gagal menghapus layanan", description: result.error, type: "error", timeout: 6000 })
        setOpen(false)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <button
            className={buttonVariants({
              variant: "outline",
              size: "icon",
              className: "rounded-xl border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white h-10 w-10 shadow-sm shrink-0",
            })}
            title="Hapus Layanan"
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl p-6 w-[90%] max-w-md border-foreground/10 dark:border-foreground-dark/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-2">
            Konfirmasi Hapus
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground dark:text-muted-foreground-dark">
            Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-end gap-3 mt-4 sm:space-x-0">
          <AlertDialogCancel
            disabled={isPending}
            className="rounded-xl text-sm font-medium transition-colors text-foreground dark:text-foreground-dark hover:bg-muted dark:hover:bg-muted-dark h-10 px-4 border-0 shadow-none disabled:opacity-50 mt-0"
          >
            Batal
          </AlertDialogCancel>
          <Button
            className={buttonVariants({
              variant: "destructive",
              size: "lg",
              className: "rounded-xl text-sm font-medium transition-colors h-10 px-4 shadow-sm min-w-[100px]",
            })}
            onClick={handleDelete}
            disabled={isPending}
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
