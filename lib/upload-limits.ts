import type { UploadPurpose } from "@/app/(admin)/dashboard/uploads/actions"

export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const PORTFOLIO_IMAGE_MAX_BYTES = 20 * 1024 * 1024

export function imageMaxBytes(purpose: UploadPurpose) {
  return purpose === "portfolio"
    ? PORTFOLIO_IMAGE_MAX_BYTES
    : PROFILE_IMAGE_MAX_BYTES
}

export function imageMaxMegabytes(purpose: UploadPurpose) {
  return imageMaxBytes(purpose) / (1024 * 1024)
}
