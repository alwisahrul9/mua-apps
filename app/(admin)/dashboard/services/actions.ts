"use server"

import axios, { AxiosError } from "axios"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { apiErrorMessage } from "@/lib/api/client"
import { serverApi } from "@/lib/api/server"
import { listServices } from "@/lib/api/dashboard"

const serviceSchema = z.object({
  name: z.string().trim().min(1, "Nama layanan wajib diisi").max(255, "Nama layanan maksimal 255 karakter"),
  price: z.coerce.number().int("Harga harus berupa angka bulat").min(50_000, "Harga layanan minimal Rp50.000").max(1_000_000_000, "Harga layanan maksimal Rp1.000.000.000"),
  description: z.string().trim().max(10_000, "Deskripsi maksimal 10.000 karakter").optional(),
  iconName: z.string().trim().min(1, "Ikon wajib dipilih").max(100, "Nama ikon maksimal 100 karakter"),
})

export type ServiceField = keyof z.infer<typeof serviceSchema>
export type ServiceFormState = {
  error?: string
  errors?: Partial<Record<ServiceField, string[]>>
}

type LaravelValidationResponse = {
  message?: string
  errors?: Record<string, string[]>
}

const backendFields: Record<string, ServiceField> = {
  name: "name",
  price: "price",
  description: "description",
  icon_name: "iconName",
}

function actionError(error: unknown, fallback: string): ServiceFormState {
  if (!axios.isAxiosError(error)) return { error: apiErrorMessage(error, fallback) }

  const response = (error as AxiosError<LaravelValidationResponse>).response
  const errors: ServiceFormState["errors"] = {}
  for (const [backendField, messages] of Object.entries(
    response?.data?.errors ?? {},
  )) {
    const field = backendFields[backendField.split(".")[0]]
    if (field) errors[field] = messages
  }

  if (Object.keys(errors).length > 0) return { errors }
  return { error: response?.data?.message ?? fallback }
}

export async function getServicesPage(page: number) {
  try {
    const result = await listServices(page)
    return {
      data: result.data,
      currentPage: result.currentPage ?? page,
      lastPage: result.lastPage ?? page,
    }
  } catch (error) {
    return {
      data: [],
      currentPage: page,
      lastPage: page,
      error: apiErrorMessage(error, "Gagal memuat layanan berikutnya."),
    }
  }
}

function parse(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    description: formData.get("description"),
    iconName: formData.get("iconName"),
  })
}

export async function createService(
  _previousState: ServiceFormState | undefined,
  formData: FormData,
): Promise<ServiceFormState> {
  const fields = parse(formData)
  if (!fields.success) return { errors: fields.error.flatten().fieldErrors }

  try {
    await (await serverApi()).post("/dashboard/services", {
      name: fields.data.name,
      price: fields.data.price,
      description: fields.data.description || null,
      icon_name: fields.data.iconName,
    })
  } catch (error) {
    return actionError(error, "Gagal menambahkan layanan.")
  }

  revalidatePath("/dashboard/services")
  redirect("/dashboard/services?toast=Layanan%20berhasil%20ditambahkan")
}

export async function updateService(
  id: string,
  _previousState: ServiceFormState | undefined,
  formData: FormData,
): Promise<ServiceFormState> {
  const fields = parse(formData)
  if (!fields.success) return { errors: fields.error.flatten().fieldErrors }

  try {
    await (await serverApi()).put(`/dashboard/services/${encodeURIComponent(id)}`, {
      name: fields.data.name,
      price: fields.data.price,
      description: fields.data.description || null,
      icon_name: fields.data.iconName,
    })
  } catch (error) {
    return actionError(error, "Gagal memperbarui layanan.")
  }

  revalidatePath("/dashboard/services")
  redirect("/dashboard/services?toast=Layanan%20berhasil%20diperbarui")
}

export async function deleteService(id: string) {
  try {
    await (await serverApi()).delete(`/dashboard/services/${encodeURIComponent(id)}`)
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal menghapus layanan.") }
  }
  revalidatePath("/dashboard/services")
  redirect("/dashboard/services?toast=Layanan%20berhasil%20dihapus")
}
