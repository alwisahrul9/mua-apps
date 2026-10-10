import "server-only"

import { auth } from "@/auth"
import { createApiClient } from "@/lib/api/client"
import { extractMuaProfile } from "@/lib/profile"

export async function getAuthenticatedUserState() {
  const session = await auth()

  if (!session?.user || !session.accessToken) return null

  const response = await createApiClient(session.accessToken)
    .get("/user/profile")
    .catch(() => null)
  const profile = response
    ? extractMuaProfile(response.data)
    : session.user.profile

  return { session, profile }
}
