import { unwrapData } from "@/lib/api/client"

export type EmailVerificationState = {
  isVerified: boolean
  resendAvailableAt: string | null
  retryAfter: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null
}

export function extractEmailVerificationState(
  payload: unknown,
  fallbackVerified = false,
): EmailVerificationState {
  const data = asRecord(
    unwrapData(payload as Record<string, unknown>),
  ) ?? {}
  const user = asRecord(data.user)
  const source = user ?? data
  const verifiedAt = source.emailVerifiedAt ?? data.emailVerifiedAt
  const availableAt =
    source.verificationEmailResendAvailableAt ??
    data.verificationEmailResendAvailableAt
  const retryAfter = Number(
    source.verificationEmailRetryAfter ??
      data.verificationEmailRetryAfter ??
      0,
  )

  return {
    isVerified: verifiedAt ? true : fallbackVerified,
    resendAvailableAt:
      typeof availableAt === "string" && availableAt ? availableAt : null,
    retryAfter: Number.isFinite(retryAfter)
      ? Math.max(0, Math.ceil(retryAfter))
      : 0,
  }
}
