"use server"

import axios from "axios"
import { cookies } from "next/headers"
import { createApiClient } from "@/lib/api/client"
import {
  extractEmailVerificationState,
  type EmailVerificationState,
} from "@/lib/email-verification"

export type ResendVerificationResult = EmailVerificationState & {
  success: boolean
  message: string
}

export async function resendVerificationEmail(): Promise<ResendVerificationResult> {
  const token = (await cookies()).get("verification_resend_token")?.value
  if (!token) {
    return {
      isVerified: false,
      resendAvailableAt: null,
      retryAfter: 0,
      success: false,
      message:
        "Sesi pendaftaran telah berakhir. Silakan login untuk mengirim ulang email verifikasi.",
    }
  }

  try {
    const response = await createApiClient(token).post(
      "/auth/email/verification-notification",
    )
    return {
      ...extractEmailVerificationState(response.data),
      success: true,
      message:
        "Email verifikasi berhasil dikirim. Periksa inbox atau folder Spam.",
    }
  } catch (error) {
    const response = axios.isAxiosError(error) ? error.response : undefined
    const verification = extractEmailVerificationState(response?.data)
    const backendMessage =
      response?.data &&
      typeof response.data === "object" &&
      "message" in response.data &&
      typeof response.data.message === "string"
        ? response.data.message
        : null

    return {
      ...verification,
      success: false,
      message:
        backendMessage ??
        "Email verifikasi belum dapat dikirim. Silakan coba lagi.",
    }
  }
}
