import "server-only"

import { auth } from "@/auth"
import { createApiClient } from "@/lib/api/client"

export async function serverApi() {
  const session = await auth()
  return createApiClient(session?.accessToken)
}
