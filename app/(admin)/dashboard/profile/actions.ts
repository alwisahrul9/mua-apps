"use server"

import axios, { AxiosError } from "axios"
import { revalidatePath } from "next/cache"
import { serverApi } from "@/lib/api/server"
import { toTitleCase } from "@/lib/text"
import { profileSchema, type ProfileValues } from "./schema"

export type ProfileField = keyof ProfileValues
export type ProfileState = {
  success?: string
  error?: string
  errors?: Partial<Record<ProfileField, string[]>>
}

type LaravelValidationResponse = {
  message?: string
  errors?: Record<string, string[]>
}

function parseArray(value: FormDataEntryValue | null): unknown {
  try {
    const parsed = JSON.parse(String(value ?? "[]")) as unknown
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const backendFields: Record<string, ProfileField> = {
  username: "username",
  slug: "slug",
  brand_name: "brandName",
  homepage_isActive: "homepageIsActive",
  tagline: "tagline",
  hero_title: "heroTitle",
  hero_description: "heroDescription",
  supported_brands: "supportedBrands",
  service_area: "serviceArea",
  payment_method: "paymentMethods",
  profile_image_url: "profileImageUrl",
  cover_image_url: "coverImageUrl",
  instagram_username: "instagramUsername",
  whatsapp_number: "whatsappNumber",
  address: "address",
}

export async function updateProfile(
  _previousState: ProfileState | undefined,
  formData: FormData,
): Promise<ProfileState> {
  const input = {
    username: String(formData.get("username") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    brandName: String(formData.get("brandName") ?? ""),
    homepageIsActive: formData.get("homepageIsActive") === "true",
    tagline: String(formData.get("tagline") ?? ""),
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroDescription: String(formData.get("heroDescription") ?? ""),
    supportedBrands: parseArray(formData.get("supportedBrands")),
    serviceArea: parseArray(formData.get("serviceArea")),
    paymentMethods: parseArray(formData.get("paymentMethods")),
    profileImageUrl: String(formData.get("profileImageUrl") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    instagramUsername: String(formData.get("instagramUsername") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    address: String(formData.get("address") ?? ""),
  }
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const values = parsed.data
  try {
    await (await serverApi()).put("/user/profile", {
      username: values.username,
      slug: values.slug,
      brand_name: toTitleCase(values.brandName),
      homepage_isActive: values.homepageIsActive,
      tagline: values.tagline ? toTitleCase(values.tagline) : null,
      hero_title: values.heroTitle || null,
      hero_description: values.heroDescription || null,
      supported_brands: values.supportedBrands,
      service_area: values.serviceArea.map(toTitleCase),
      payment_method: values.paymentMethods.map((method) => ({
        accountName: toTitleCase(method.accountName),
        paymentName: method.paymentName.toLocaleUpperCase("id-ID"),
        accountNumber: method.accountNumber,
      })),
      profile_image_url: values.profileImageUrl || null,
      cover_image_url: values.coverImageUrl || null,
      instagram_username: values.instagramUsername.replace(/^@/, "") || null,
      whatsapp_number: values.whatsappNumber,
      address: values.address || null,
    })
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      return { error: error instanceof Error ? error.message : "Gagal memperbarui profil." }
    }
    const response = (error as AxiosError<LaravelValidationResponse>).response
    const errors: ProfileState["errors"] = {}
    for (const [key, messages] of Object.entries(response?.data?.errors ?? {})) {
      const field = backendFields[key.split(".")[0]]
      if (field && !errors[field]) errors[field] = messages
    }
    return {
      error: response?.data?.message ?? "Periksa kembali data profil Anda.",
      ...(Object.keys(errors).length > 0 ? { errors } : {}),
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  revalidatePath("/dashboard/portfolios")
  revalidatePath(`/${values.username}`)
  return { success: "Profil berhasil diperbarui." }
}

export async function resendVerification() {
  try {
    await (await serverApi()).post("/auth/email/verification-notification")
    return { success: true }
  } catch {
    return { success: false, error: "Gagal mengirim ulang verifikasi." }
  }
}


export async function deleteProfileImage(
  purpose: "profile" | "cover",
): Promise<{ success?: string; error?: string }> {
  if (purpose !== "profile" && purpose !== "cover") {
    return { error: "Jenis gambar tidak valid." }
  }
  const field = purpose === "profile" ? "profile_image_url" : "cover_image_url"
  let username: string | null | undefined
  try {
    const response = await (await serverApi()).put<{
      data: { mua_profile?: { username?: string | null } }
    }>("/user/profile", { [field]: null })
    username = response.data.data?.mua_profile?.username
  } catch (error) {
    const message = axios.isAxiosError<LaravelValidationResponse>(error)
      ? error.response?.data?.message
      : undefined
    return { error: message ?? "Gambar gagal dihapus. Silakan coba lagi." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  if (username) revalidatePath(`/${username}`)
  return { success: purpose === "profile" ? "Foto profil berhasil dihapus." : "Gambar cover berhasil dihapus." }
}

export async function deleteBrandImage(
  url: string,
  username: string,
): Promise<{ success?: string; error?: string; supportedBrands?: string[] }> {
  const parsedUrl = profileSchema.shape.supportedBrands.element.safeParse(url)
  if (!parsedUrl.success) {
    return {
      error:
        parsedUrl.error.issues[0]?.message ?? "URL gambar brand tidak valid.",
    }
  }

  try {
    const response = await (await serverApi()).delete<{
      data: { supported_brands?: string[] }
    }>("/dashboard/media/brands", { data: { url: parsedUrl.data } })
    const supportedBrands = response.data.data?.supported_brands
    if (!Array.isArray(supportedBrands)) {
      return { error: "Daftar brand terbaru tidak ditemukan dari backend." }
    }

    revalidatePath("/dashboard/profile")
    if (/^[a-z0-9_]{3,30}$/.test(username)) revalidatePath(`/${username}`)
    return {
      success: "Gambar brand berhasil dihapus.",
      supportedBrands,
    }
  } catch (error) {
    const message = axios.isAxiosError<LaravelValidationResponse>(error)
      ? error.response?.data?.message
      : undefined
    return {
      error: message ?? "Gambar brand gagal dihapus. Silakan coba lagi.",
    }
  }
}
