import Link from "next/link"
import { ArrowLeft, KeyRound } from "lucide-react"
import ResetPasswordForm from "./[token]/ResetPasswordForm"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[]
    email?: string | string[]
  }>
}) {
  const query = await searchParams
  const token = typeof query.token === "string" ? query.token : ""
  const email = typeof query.email === "string" ? query.email : ""

  if (token) {
    return <ResetPasswordForm token={token} initialEmail={email} />
  }

  return (
    <main className="container-custom flex min-h-dvh items-center justify-center px-4 pb-12 pt-24">
      <section className="w-full max-w-md rounded-3xl border border-foreground-dark/10 bg-background-dark p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-dark/10 text-primary-dark">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-serif text-3xl">Tautan reset tidak valid</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground-dark">
          Token reset password tidak ditemukan. Minta tautan baru melalui
          halaman lupa password.
        </p>
        <Link
          href="/forgot-password"
          className="mt-7 inline-flex items-center gap-2 font-medium text-primary-dark transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          Minta tautan baru
        </Link>
      </section>
    </main>
  )
}
