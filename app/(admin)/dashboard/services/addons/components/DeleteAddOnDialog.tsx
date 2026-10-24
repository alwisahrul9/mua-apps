"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function DeleteAddOnDialog({
  name,
  action,
}: {
  name: string;
  action: () => Promise<{ error?: string } | void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        toast.add({
          title: "Gagal Menghapus Add-on",
          description: result.error,
          type: "error",
          timeout: 6000,
        });
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-red-500/20 bg-red-500/10 text-red-500 shadow-sm hover:bg-red-500 hover:text-white"
            aria-label={`Hapus add-on ${name}`}
            title="Hapus Add-on"
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>

      <AlertDialogContent className="w-[90%] max-w-md rounded-2xl border-foreground/10 p-6 dark:border-foreground-dark/10">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Add-on?</AlertDialogTitle>
          <AlertDialogDescription>
            Add-on <strong>{name}</strong> akan dihapus dari seluruh layanan
            terkait. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 sm:space-x-0">
          <AlertDialogCancel
            disabled={pending}
            className="h-10 rounded-xl"
          >
            Batal
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={handleDelete}
            className="h-10 rounded-xl"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 />}
            {pending ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
