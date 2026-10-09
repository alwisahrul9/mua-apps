"use server"

import axios, { AxiosError } from "axios"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { serverApi } from "@/lib/api/server"
import { extractMuaProfile, isProfileComplete } from "@/lib/profile"
import { normalizeWhatsappNumber } from "@/lib/phone"
import { toTitleCase } from "@/lib/text"

export type OnboardingField =
  | "username"
  | "brandName"
  | "serviceArea"
  | "paymentMethods"
  | "whatsappNumber"

export type OnboardingState = {
  error?: string
  errors?: Partial<Record<OnboardingField, string[]>>
}

type LaravelValidationResponse = {
  message?: string
  errors?: Record<string, string[]>
}

export async function completeOnboarding(
  _previousState: OnboardingState | undefined,
  formData: FormData,
): Promise<OnboardingState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase()
  const brandName = toTitleCase(String(formData.get("brandName") ?? ""))
  const serviceArea = formData
    .getAll("serviceArea")
    .map(String)
    .map(toTitleCase)
    .filter(Boolean)
  const whatsappNumber = normalizeWhatsappNumber(
    String(formData.get("whatsappNumber") ?? ""),
  )
  let paymentMethods: Array<{
    accountName: string
    paymentName: string
    accountNumber: string
  }> = []

  try {
    const parsedPaymentMethods = JSON.parse(
      String(formData.get("paymentMethods") ?? "[]"),
    ) as unknown
    if (Array.isArray(parsedPaymentMethods)) {
      paymentMethods = parsedPaymentMethods.map((method) => {
        const item = method as Record<string, unknown>
        return {
          accountName: toTitleCase(String(item.accountName ?? "")),
          paymentName: String(item.paymentName ?? "").trim().toLocaleUpperCase("id-ID"),
          accountNumber: String(item.accountNumber ?? "").trim(),
        }
      })
    }
  } catch {
    return { errors: { paymentMethods: ["Data metode pembayaran tidak valid"] } }
  }
  const api = await serverApi()
  const currentResponse = await api.get("/user/profile").catch(() => null)

  if (currentResponse && isProfileComplete(extractMuaProfile(currentResponse.data))) {
    redirect("/dashboard")
  }

  try {
    await api.put("/user/profile", {
      username,
      brand_name: brandName,
      service_area: serviceArea,
      payment_method: paymentMethods,
      whatsapp_number: whatsappNumber,
    })
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      return {
        error: error instanceof Error ? error.message : "Gagal menyimpan profil MUA.",
      }
    }

    const response = (error as AxiosError<LaravelValidationResponse>).response
    const backendErrors: OnboardingState["errors"] = {}

    for (const [key, messages] of Object.entries(response?.data?.errors ?? {})) {
      const normalizedKey = key.replace(/\.\d+$/, "")
      if (normalizedKey === "username") backendErrors.username = messages
      if (normalizedKey === "brand_name") backendErrors.brandName = messages
      if (normalizedKey === "service_area") backendErrors.serviceArea = messages
      if (normalizedKey.startsWith("payment_method")) {
        backendErrors.paymentMethods = messages
      }
      if (normalizedKey === "whatsapp_number") backendErrors.whatsappNumber = messages
    }

    return {
      error: response?.data?.message ?? "Gagal menyimpan profil MUA.",
      ...(Object.keys(backendErrors).length > 0 ? { errors: backendErrors } : {}),
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  redirect("/dashboard")
}
