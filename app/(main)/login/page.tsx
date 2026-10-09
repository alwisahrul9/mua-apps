'use client'

import { Suspense, useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { login, loginWithGoogle, type LoginFields } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  )
}

function GoogleLoginButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="h-auto w-full rounded-full border-foreground-dark/20 bg-transparent py-3.5 text-foreground-dark hover:bg-muted-dark disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
      {pending ? 'Menghubungkan ke Google...' : 'Lanjutkan dengan Google'}
    </Button>
  )
}

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const [values, setValues] = useState<LoginFields>({ email: '', password: '' })
  const searchParams = useSearchParams()
  const registrationSucceeded = searchParams.get('registered') === '1'
  const oauthError = searchParams.get('error')

  function updateField(name: keyof LoginFields, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className="min-h-dvh pt-24 pb-12 px-4 container-custom flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl mb-4">MUA Dashboard</h1>
          <p className="text-muted-foreground-dark">Silakan login untuk mengelola booking.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-dark border border-foreground-dark/10 rounded-3xl p-8 shadow-sm"
        >
          {registrationSucceeded && (
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-500">
              Akun berhasil dibuat. Silakan login dan periksa email Anda untuk melakukan verifikasi.
            </div>
          )}

          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {state.error}
            </div>
          )}

          {oauthError && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              {oauthError === 'OAuthAccountNotLinked'
                ? 'Email ini sudah terdaftar dengan metode login lain. Masuk menggunakan email dan password.'
                : 'Login Google gagal diproses. Pastikan konfigurasi Google pada frontend dan backend sudah benar.'}
            </div>
          )}

          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                <Input 
                  id="email"
                  required 
                  name="email" 
                  type="email" 
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(state?.errors?.email)}
                  aria-describedby={state?.errors?.email ? 'email-error' : undefined}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" 
                  placeholder="admin@example.com" 
                />
              </div>
              {state?.errors?.email && (
                <p id="email-error" className="text-xs text-red-500">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                <Input 
                  id="password"
                  required 
                  name="password" 
                  type="password" 
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(state?.errors?.password)}
                  aria-describedby={state?.errors?.password ? 'password-error' : undefined}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" 
                  placeholder="••••••••" 
                />
              </div>
              {state?.errors?.password && (
                <p id="password-error" className="text-xs text-red-500">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-auto py-4 bg-primary-dark text-primary-foreground-dark hover:bg-primary-dark rounded-full font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Login ke Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground-dark">
            <span className="h-px flex-1 bg-foreground-dark/10" />
            atau
            <span className="h-px flex-1 bg-foreground-dark/10" />
          </div>

          <form action={loginWithGoogle}>
            <GoogleLoginButton />
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground-dark">
            Belum memiliki akun? <Link href="/register" className="font-medium text-primary-dark">Daftar sekarang</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
