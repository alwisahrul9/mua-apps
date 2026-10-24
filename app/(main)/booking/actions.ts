"use server"

import axios, { AxiosError } from "axios"
import { z } from "zod"
import { createPublicBooking, getPublicServices } from "@/lib/api/public"
import { updateTag } from "next/cache"
import { notificationUsernameCacheTag } from "@/lib/notification-cache"

type BookingFields = {
  muaSlug: string
  clientName: string
  whatsapp: string
  instagram: string
  totalPerson: string
  serviceId: string
  addOns: { addon_id: string; quantity: number }[]
  eventName: string
  eventDate: string
  eventTime: string
  location: string
  notes: string
}

export type BookingState = {
  message?: string
  errors?: Partial<Record<keyof BookingFields, string[]>>
  redirectTo?: string
}

type LaravelValidationResponse = {
  message?: string
  errors?: Record<string, string[]>
}

const backendFieldNames: Record<string, keyof BookingFields> = {
  username: "muaSlug",
  service_id: "serviceId",
  addons: "addOns",
  add_ons: "addOns",
  client_name: "clientName",
  whatsapp: "whatsapp",
  instagram: "instagram",
  total_person: "totalPerson",
  event_name: "eventName",
  event_date: "eventDate",
  event_time: "eventTime",
  location: "location",
  notes: "notes",
}

const bookingSchema = z.object({
  muaSlug: z.string().min(1),
  clientName: z.string().min(1, "Nama lengkap harus diisi"),
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit").regex(/^08[0-9]+$/, "Nomor WhatsApp harus diawali dengan 08"),
  instagram: z.string().optional(),
  totalPerson: z.coerce.number().min(1, "Jumlah orang minimal 1"),
  serviceId: z.string().min(1, "Layanan harus dipilih"),
  addOns: z
    .array(
      z.object({
        addon_id: z.string().min(1, "Add-on tidak valid"),
        quantity: z.coerce.number().int().min(1).max(999),
      }),
    )
    .max(50, "Jumlah add-on terlalu banyak"),
  eventName: z.string().min(1, "Jenis acara harus diisi"),
  eventDate: z.string().min(1, "Tanggal acara harus diisi"),
  eventTime: z.string().min(1, "Waktu acara harus diisi"),
  location: z.string().min(1, "Lokasi harus diisi"),
  notes: z.string().optional(),
})

export async function getServices(username: string) {
  return getPublicServices(username)
}

export async function createBooking(
  _prevState: BookingState | null,
  formData: FormData,
): Promise<BookingState> {
  const rawAddOns = String(formData.get("addOns") ?? "[]")
  let addOns: unknown = []
  try {
    addOns = JSON.parse(rawAddOns)
  } catch {
    return {
      errors: { addOns: ["Pilihan add-on tidak valid"] },
    }
  }

  const raw = { ...Object.fromEntries(formData.entries()), addOns }
  const parsed = bookingSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = parsed.data
  let bookingCode: string | undefined
  try {
    const booking = await createPublicBooking({
      username: data.muaSlug,
      service_id: data.serviceId,
      addons: data.addOns,
      client_name: data.clientName,
      whatsapp: data.whatsapp,
      instagram: data.instagram || null,
      total_person: data.totalPerson,
      event_name: data.eventName,
      event_date: data.eventDate,
      event_time: data.eventTime,
      location: data.location,
      notes: data.notes || null,
    })
    bookingCode = booking.customCode
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      return {
        message:
          error instanceof Error ? error.message : "Gagal membuat booking.",
      }
    }

    const response = (error as AxiosError<LaravelValidationResponse>).response
    const errors: BookingState["errors"] = {}

    for (const [backendField, messages] of Object.entries(
      response?.data?.errors ?? {},
    )) {
      const field = backendFieldNames[backendField.split(".")[0]]
      if (field && Array.isArray(messages)) {
        errors[field] = [...(errors[field] ?? []), ...messages]
      }
    }

    const hasFieldErrors = Object.keys(errors).length > 0
    if (hasFieldErrors) return { errors }

    return {
      message:
        response?.data?.message ??
        "Gagal membuat booking. Silakan coba lagi.",
    }
  }

  if (!bookingCode) {
    return { message: "Kode booking tidak diterima. Silakan coba lagi." }
  }

  updateTag(notificationUsernameCacheTag(data.muaSlug))

  return {
    redirectTo: `/${encodeURIComponent(data.muaSlug)}/booking/success/${encodeURIComponent(bookingCode)}`,
  }
}
