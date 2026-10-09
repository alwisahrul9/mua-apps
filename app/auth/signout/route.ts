import { auth, signOut } from '@/auth'
import { createApiClient } from '@/lib/api/client'

export async function POST() {
  const session = await auth()
  if (session?.accessToken) {
    try {
      await createApiClient(session.accessToken).post('/auth/logout')
    } catch {
      // Tetap hapus sesi frontend jika token backend sudah tidak valid.
    }
  }
  await signOut({ redirectTo: '/' })
}
