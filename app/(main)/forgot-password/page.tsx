"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { forgotPassword } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, undefined)
  const [email, setEmail] = useState("")
  const emailError = state?.errors?.email?.[0]

  return (
    <main className="public-light flex min-h-dvh w-full items-center justify-center bg-background px-4 pb-12 pt-24 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-foreground/10 bg-card p-6 shadow-sm sm:p-8">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke login
        </Link>

        <h1 className="font-serif text-3xl">Lupa password</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Masukkan email akun Anda. Kami akan mengirimkan tautan untuk membuat
          password baru.
        </p>

        {state?.success ? (
          <div className="mt-6 rounded-xl border border-green-700/30 bg-green-50 p-4 text-sm leading-6 text-green-800">
            {state.success}
          </div>
        ) : (
          <form action={action} className="mt-8 space-y-6" noValidate>
            {state?.error && (
              <div className="rounded-xl border border-red-700/30 bg-red-50 p-4 text-sm text-red-800">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "forgot-email-error" : undefined}
                  className="h-auto rounded-xl border-foreground/20 bg-transparent py-3 pl-10 pr-4"
                />
              </div>
              {emailError && (
                <p id="forgot-email-error" className="text-xs text-red-700">
                  {emailError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="h-auto w-full rounded-full bg-primary py-4 text-primary-foreground hover:bg-primary hover:opacity-90"
            >
              {pending && <Loader2 className="h-5 w-5 animate-spin" />}
              {pending ? "Mengirim..." : "Kirim tautan reset password"}
            </Button>
          </form>
        )}
      </section>
    </main>
  )
}
