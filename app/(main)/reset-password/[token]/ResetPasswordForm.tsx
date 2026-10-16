"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Lock } from "lucide-react"
import { resetPassword } from "../../forgot-password/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordForm({
  token,
  initialEmail,
}: {
  token: string
  initialEmail: string
}) {
  const [state, action, pending] = useActionState(resetPassword, undefined)
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")

  return (
    <main className="container-custom flex min-h-dvh items-center justify-center px-4 pb-12 pt-24">
      <section className="w-full max-w-md rounded-3xl border border-foreground-dark/10 bg-background-dark p-6 shadow-sm sm:p-8">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground-dark transition-colors hover:text-foreground-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke login
        </Link>

        <h1 className="font-serif text-3xl">Buat password baru</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground-dark">
          Gunakan password baru yang kuat dan berbeda dari password sebelumnya.
        </p>

        <form action={action} className="mt-8 space-y-6" noValidate>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={initialEmail} />

          {state?.error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reset-password">Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground-dark" />
              <Input
                id="reset-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
                aria-invalid={Boolean(state?.errors?.password)}
                aria-describedby="reset-password-help"
                className="h-auto rounded-xl border-foreground-dark/20 bg-transparent py-3 pl-10 pr-4"
              />
            </div>
            <p id="reset-password-help" className="text-xs leading-5 text-muted-foreground-dark">
              Minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan
              salah satu simbol @$!%*?&amp;.
            </p>
            {state?.errors?.password && (
              <p className="text-xs text-red-500">{state.errors.password[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-confirmation">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground-dark" />
              <Input
                id="password-confirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                disabled={pending}
                aria-invalid={Boolean(state?.errors?.passwordConfirmation)}
                className="h-auto rounded-xl border-foreground-dark/20 bg-transparent py-3 pl-10 pr-4"
              />
            </div>
            {state?.errors?.passwordConfirmation && (
              <p className="text-xs text-red-500">
                {state.errors.passwordConfirmation[0]}
              </p>
            )}
          </div>

          {(state?.errors?.token || state?.errors?.email) && (
            <p className="text-sm text-red-500">
              {state.errors.token?.[0] ??
                state.errors.email?.[0] ??
                "Tautan reset password tidak valid."}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-auto w-full rounded-full bg-primary-dark py-4 text-primary-foreground-dark hover:bg-primary-dark hover:opacity-90"
          >
            {pending && <Loader2 className="h-5 w-5 animate-spin" />}
            {pending ? "Menyimpan..." : "Simpan password baru"}
          </Button>
        </form>
      </section>
    </main>
  )
}
