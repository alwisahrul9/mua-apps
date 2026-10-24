"use server"

import axios, { AxiosError } from "axios"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { apiErrorMessage } from "@/lib/api/client"
import { serverApi } from "@/lib/api/server"
import { invalidateCurrentAddOnsCache } from "@/lib/content-cache"

const addOnSchema = z
  .object({
    name: z.string().trim().min(1, "Nama add-on wajib diisi").max(255, "Nama add-on maksimal 255 karakter"),
    description: z.string().trim().max(10_000, "Deskripsi maksimal 10.000 karakter"),
    billingType: z.enum(["flat", "per_unit"], "Pilih tipe penagihan"),
    unit: z.enum(["item", "hourly", "person"], "Pilih satuan add-on").nullable(),
    price: z.coerce.number().int("Harga harus berupa angka bulat").min(0, "Harga tidak boleh kurang dari Rp0").max(1_000_000_000, "Harga maksimal Rp1.000.000.000"),
    isActive: z.boolean(),
    serviceIds: z.array(z.string().trim().min(1)).min(1, "Pilih minimal satu layanan"),
  })
  .superRefine((data, context) => {
    if (data.billingType === "per_unit" && !data.unit) {
      context.addIssue({
        code: "custom",
        path: ["unit"],
        message: "Pilih satuan untuk tipe penagihan Per Unit",
      })
    }
  })

export type AddOnField = keyof z.infer<typeof addOnSchema>
export type AddOnFormValues = {
  name: string
  description: string
  billingType: string
  unit: string
  price: string
  isActive: boolean
  serviceIds: string[]
}
export type AddOnFormState = {
  error?: string
  errors?: Partial<Record<AddOnField, string[]>>
  values?: AddOnFormValues
}

type LaravelValidationResponse = {
  message?: string
  errors?: Record<string, string[]>
}

const backendFields: Record<string, AddOnField> = {
  name: "name",
  description: "description",
  billing_type: "billingType",
  unit: "unit",
  price: "price",
  is_active: "isActive",
  service_ids: "serviceIds",
  services: "serviceIds",
}

function valuesFrom(formData: FormData): AddOnFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    billingType: String(formData.get("billingType") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    price: String(formData.get("price") ?? ""),
    isActive: String(formData.get("isActive") ?? "true") === "true",
    serviceIds: formData.getAll("serviceIds").map(String),
  }
}

function actionError(
  error: unknown,
  values: AddOnFormValues,
  fallback: string,
): AddOnFormState {
  if (!axios.isAxiosError(error)) {
    return { error: apiErrorMessage(error, fallback), values }
  }

  const response = (error as AxiosError<LaravelValidationResponse>).response
  const errors: AddOnFormState["errors"] = {}
  for (const [backendField, messages] of Object.entries(response?.data?.errors ?? {})) {
    const field = backendFields[backendField.split(".")[0]]
    if (field) errors[field] = [...(errors[field] ?? []), ...messages]
  }

  if (Object.keys(errors).length > 0) return { errors, values }
  return {
    error: response?.data?.message ?? fallback,
    values,
  }
}

export async function createAddOn(
  _previousState: AddOnFormState | undefined,
  formData: FormData,
): Promise<AddOnFormState> {
  const values = valuesFrom(formData)
  const fields = addOnSchema.safeParse({
    ...values,
    unit: values.billingType === "flat" ? null : values.unit || null,
  })

  if (!fields.success) {
    return { errors: fields.error.flatten().fieldErrors, values }
  }

  try {
    await (await serverApi()).post("/dashboard/addons", {
      name: fields.data.name,
      description: fields.data.description || null,
      billing_type: fields.data.billingType,
      unit: fields.data.billingType === "flat" ? null : fields.data.unit,
      price: fields.data.price,
      is_active: fields.data.isActive,
      service_ids: fields.data.serviceIds,
    }, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return actionError(error, values, "Gagal menambahkan add-on.")
  }

  await invalidateCurrentAddOnsCache()
  revalidatePath("/dashboard/services")
  redirect("/dashboard/services?tab=add-ons&toast=Add-on%20berhasil%20ditambahkan")
}

export async function updateAddOn(
  id: string,
  _previousState: AddOnFormState | undefined,
  formData: FormData,
): Promise<AddOnFormState> {
  const values = valuesFrom(formData)
  const fields = addOnSchema.safeParse({
    ...values,
    unit: values.billingType === "flat" ? null : values.unit || null,
  })

  if (!fields.success) {
    return { errors: fields.error.flatten().fieldErrors, values }
  }

  try {
    await (await serverApi()).put(`/dashboard/addons/${encodeURIComponent(id)}`, {
      name: fields.data.name,
      description: fields.data.description || null,
      billing_type: fields.data.billingType,
      unit: fields.data.billingType === "flat" ? null : fields.data.unit,
      price: fields.data.price,
      is_active: fields.data.isActive,
      service_ids: fields.data.serviceIds,
    }, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return actionError(error, values, "Gagal memperbarui add-on.")
  }

  await invalidateCurrentAddOnsCache()
  revalidatePath("/dashboard/services")
  revalidatePath(`/dashboard/services/addons/${id}`)
  redirect(`/dashboard/services/addons/${id}?toast=Add-on%20berhasil%20diperbarui`)
}

export async function deleteAddOn(id: string) {
  try {
    await (await serverApi()).delete(
      `/dashboard/addons/${encodeURIComponent(id)}`,
      { headers: { Accept: "application/json" } },
    )
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal menghapus add-on.") }
  }

  await invalidateCurrentAddOnsCache()
  revalidatePath("/dashboard/services")
  redirect("/dashboard/services?tab=add-ons&toast=Add-on%20berhasil%20dihapus")
}
