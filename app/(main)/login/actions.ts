'use server'

import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { signIn } from '@/auth'

export type LoginFields = {
  email: string
  password: string
}

export type LoginState = {
  error?: string
  errors?: Partial<Record<keyof LoginFields, string[]>>
}

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export async function login(
  _previousState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const fields: LoginFields = {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  }
  const parsed = loginSchema.safeParse(fields)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const result = await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      redirectTo: '/onboarding',
    })

    const resultUrl = new URL(result, 'http://localhost')
    const authError = resultUrl.searchParams.get('error')

    if (authError === 'CredentialsSignin') {
      return {
        error: 'Email atau password salah.',
        errors: { email: ['Periksa kembali email dan password Anda.'] },
      }
    }

    if (authError) {
      return {
        error: 'Login tidak dapat diproses. Periksa konfigurasi autentikasi atau coba kembali.',
      }
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email atau password salah.' }
    }
    return { error: 'Backend tidak dapat dihubungi. Silakan coba kembali.' }
  }

  redirect('/onboarding')
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/onboarding' })
}
