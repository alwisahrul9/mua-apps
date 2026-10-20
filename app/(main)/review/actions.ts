"use server"

import { z } from "zod"
import { updateTag } from "next/cache"
import { apiErrorMessage } from "@/lib/api/client"
import { submitReview } from "@/lib/api/public"
import { publicReviewsCacheTag } from "@/lib/seo-cache"

const reviewSchema = z.object({
  token: z.string().trim().min(1, "Tautan ulasan tidak valid."),
  rating: z.coerce.number().int().min(1, "Pilih rating.").max(5, "Rating maksimal 5."),
  reviewText: z.string().trim().min(10, "Ulasan minimal 10 karakter.").max(2000, "Ulasan maksimal 2.000 karakter."),
  consent: z.boolean().refine((value) => value, {
    message: "Persetujuan wajib diberikan sebelum mengirim ulasan.",
  }),
  username: z.string().trim().regex(/^[a-z0-9_]{3,30}$/).optional().or(z.literal("")),
})

export type ReviewFormState = {
  success?: string
  error?: string
  errors?: Partial<Record<"rating" | "reviewText" | "consent", string[]>>
}

export async function sendReview(
  _state: ReviewFormState | undefined,
  formData: FormData,
): Promise<ReviewFormState> {
  const parsed = reviewSchema.safeParse({
    token: formData.get("token"),
    rating: formData.get("rating"),
    reviewText: formData.get("reviewText"),
    consent: formData.get("consent") === "true",
    username: formData.get("username"),
  })
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors
    return {
      errors: {
        rating: fields.rating,
        reviewText: fields.reviewText,
        consent: fields.consent,
      },
    }
  }
  try {
    await submitReview(parsed.data)
    if (parsed.data.username) updateTag(publicReviewsCacheTag(parsed.data.username))
    return { success: "Terima kasih. Ulasan Anda berhasil dikirim." }
  } catch (error) {
    return { error: apiErrorMessage(error, "Ulasan gagal dikirim. Tautan mungkin sudah digunakan atau kedaluwarsa.") }
  }
}
