import { z } from "zod"
import { normalizeWhatsappNumber } from "@/lib/phone"

const optionalHttpUrl = (label: string) =>
  z.string().trim().max(2048, `${label} maksimal 2048 karakter`).refine((value) => {
    if (!value) return true
    try {
      const url = new URL(value)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }, `${label} harus berupa URL http atau https yang valid`)

export const profilePaymentMethodSchema = z.object({
  accountName: z.string().trim().min(1, "Nama pemilik wajib diisi").max(255),
  paymentName: z.string().trim().min(1, "Nama pembayaran wajib diisi").max(100),
  accountNumber: z.string().trim().min(1, "Nomor akun wajib diisi").max(100).regex(/^\d+$/, "Nomor akun hanya boleh berisi angka"),
})

export const profileSchema = z.object({
  username: z.string().trim().toLowerCase().min(3, "Username minimal 3 karakter").max(30, "Username maksimal 30 karakter").regex(/^[a-z0-9_]+$/, "Gunakan huruf kecil, angka, dan underscore tanpa spasi"),
  slug: z.string().trim().toLowerCase().min(1, "Slug wajib diisi").max(100, "Slug maksimal 100 karakter").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung"),
  brandName: z.string().trim().min(2, "Nama brand minimal 2 karakter").max(255),
  homepageIsActive: z.boolean(),
  tagline: z.string().trim().max(255, "Tagline maksimal 255 karakter"),
  heroTitle: z.string().trim().max(255, "Judul hero maksimal 255 karakter"),
  heroDescription: z.string().trim().max(10000, "Deskripsi maksimal 10.000 karakter"),
  supportedBrands: z.array(optionalHttpUrl("URL brand").refine(Boolean, "URL brand tidak boleh kosong")).max(10, "Brand pendukung maksimal 10"),
  serviceArea: z.array(z.string().trim().min(1).max(100, "Nama wilayah maksimal 100 karakter")).min(1, "Tambahkan minimal satu wilayah layanan").max(100, "Wilayah layanan maksimal 100"),
  paymentMethods: z.array(profilePaymentMethodSchema).min(1, "Tambahkan minimal satu metode pembayaran").max(20, "Metode pembayaran maksimal 20"),
  profileImageUrl: optionalHttpUrl("URL foto profil"),
  coverImageUrl: optionalHttpUrl("URL cover"),
  instagramUsername: z.string().trim().max(100, "Username Instagram maksimal 100 karakter").refine((value) => !value || /^@?[A-Za-z0-9._]+$/.test(value), "Username Instagram tidak valid"),
  whatsappNumber: z.string().trim().min(1, "Nomor WhatsApp wajib diisi").transform(normalizeWhatsappNumber).pipe(z.string().regex(/^628\d{7,11}$/, "Nomor WhatsApp Indonesia tidak valid")),
  address: z.string().trim().max(5000, "Alamat maksimal 5.000 karakter"),
})

export type ProfileValues = z.infer<typeof profileSchema>
export type ProfilePaymentMethod = z.infer<typeof profilePaymentMethodSchema>
