"use server"

import { apiErrorMessage, unwrapData } from "@/lib/api/client"
import { serverApi } from "@/lib/api/server"
import { imageMaxBytes, imageMaxMegabytes } from "@/lib/upload-limits"

export type UploadPurpose = "portfolio" | "profile" | "cover" | "brand"
export type CompletedUploadPart = { partNumber: number; etag: string }

export async function createMultipartUpload(input: {
  fileName: string
  contentType: string
  fileSize: number
  purpose: UploadPurpose
}) {
  const maxFileSize = imageMaxBytes(input.purpose)
  if (input.fileSize > maxFileSize) {
    return {
      error: `Ukuran file untuk ${input.purpose === "cover" ? "gambar cover" : input.purpose === "profile" ? "foto profil" : input.purpose === "brand" ? "logo brand" : "portofolio"} maksimal ${imageMaxMegabytes(input.purpose)} MB.`,
    }
  }

  try {
    const response = await (await serverApi()).post("/dashboard/media/multipart/create", {
      file_name: input.fileName,
      content_type: input.contentType,
      file_size: input.fileSize,
      purpose: input.purpose,
    })
    return {
      data: unwrapData<{
        uploadId: string
        key: string
        partSize: number
        url: string
        parts: Array<{ partNumber: number; url: string }>
      }>(response.data),
    }
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal memulai upload.") }
  }
}

export async function signUploadParts(input: {
  uploadId: string
  key: string
  partNumbers: number[]
}) {
  try {
    const response = await (await serverApi()).post("/dashboard/media/multipart/sign-parts", {
      upload_id: input.uploadId,
      key: input.key,
      part_numbers: input.partNumbers,
    })
    return {
      data: unwrapData<{ parts: Array<{ partNumber: number; url: string }> }>(response.data),
    }
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal menyiapkan bagian upload.") }
  }
}

export async function completeMultipartUpload(input: {
  uploadId: string
  key: string
  parts: CompletedUploadPart[]
}) {
  try {
    const response = await (await serverApi()).post("/dashboard/media/multipart/complete", {
      upload_id: input.uploadId,
      key: input.key,
      parts: input.parts.map((part) => ({
        part_number: part.partNumber,
        etag: part.etag,
      })),
    })
    return { data: unwrapData<{ url: string }>(response.data) }
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal menyelesaikan upload.") }
  }
}

export async function abortMultipartUpload(input: {
  uploadId: string
  key: string
}) {
  try {
    await (await serverApi()).post("/dashboard/media/multipart/abort", {
      upload_id: input.uploadId,
      key: input.key,
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: apiErrorMessage(error, "Gagal membatalkan upload.") }
  }
}
