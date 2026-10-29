"use client"

import { LogOut } from "lucide-react"
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
import { Button } from "@/components/ui/button"

export default function LogoutDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-foreground/15 bg-transparent text-foreground hover:bg-muted"
          />
        }
      >
        <LogOut className="h-4 w-4" />
        Logout
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl border border-foreground/10 bg-background text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Data onboarding yang belum disimpan akan hilang. Anda perlu login kembali untuk melanjutkannya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="destructive" className="w-full rounded-xl">
              Ya, logout
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
