import { z } from "zod"
import { normalizeWhatsappNumber } from "@/lib/phone"

export const paymentMethodSchema = z.object({
  accountName: z
    .string()
    .trim()
    .min(1, "Nama pemilik wajib diisi")
    .max(255, "Nama pemilik maksimal 255 karakter"),
  paymentName: z
    .string()
    .trim()
    .min(1, "Nama pembayaran wajib diisi")
    .max(100, "Nama pembayaran maksimal 100 karakter"),
  accountNumber: z
    .string()
    .trim()
    .min(1, "Nomor akun wajib diisi")
    .max(100, "Nomor akun maksimal 100 digit")
    .regex(/^\d+$/, "Nomor akun hanya boleh berisi angka"),
})

export type PaymentMethodValues = z.infer<typeof paymentMethodSchema>

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Username wajib diisi")
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(
      /^[a-z0-9_]+$/,
      "Gunakan hanya huruf kecil, angka, dan underscore tanpa spasi",
    ),
  brandName: z
    .string()
    .trim()
    .min(1, "Nama brand wajib diisi")
    .min(2, "Nama brand minimal 2 karakter")
    .max(100, "Nama brand maksimal 100 karakter"),
  serviceArea: z
    .array(z.string().trim().min(1))
    .min(1, "Tambahkan minimal satu wilayah layanan")
    .max(20, "Wilayah layanan maksimal 20"),
  paymentMethods: z
    .array(paymentMethodSchema)
    .min(1, "Tambahkan minimal satu metode pembayaran")
    .max(20, "Metode pembayaran maksimal 20"),
  whatsappNumber: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi")
    .transform(normalizeWhatsappNumber)
    .pipe(
      z
        .string()
        .regex(
          /^628\d{7,11}$/,
          "Masukkan nomor WhatsApp Indonesia yang valid, misalnya 081234567890",
        ),
    ),
})

export type OnboardingValues = z.infer<typeof onboardingSchema>
