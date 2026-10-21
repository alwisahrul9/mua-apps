import "server-only"

import { auth } from "@/auth"
import { createApiClient } from "@/lib/api/client"
import { extractMuaProfile } from "@/lib/profile"
import { extractEmailVerificationState } from "@/lib/email-verification"

export async function getAuthenticatedUserState() {
  const session = await auth()

  if (!session?.user || !session.accessToken) return null

  const response = await createApiClient(session.accessToken)
    .get("/user/profile")
    .catch(() => null)
  const profile = response
    ? extractMuaProfile(response.data)
    : session.user.profile
  const emailVerification = response
    ? (() => {
        const current = extractEmailVerificationState(
          response.data,
          session.user.isEmailVerified,
        )
        return {
          ...current,
          resendAvailableAt:
            current.resendAvailableAt ??
            session.user.verificationEmailResendAvailableAt,
          retryAfter: current.retryAfter,
        }
      })()
    : {
        isVerified: session.user.isEmailVerified,
        resendAvailableAt:
          session.user.verificationEmailResendAvailableAt,
        retryAfter: session.user.verificationEmailResendAvailableAt
          ? 0
          : session.user.verificationEmailRetryAfter,
      }

  return {
    session,
    profile,
    profileRequestSucceeded: response !== null,
    emailVerification,
  }
}
