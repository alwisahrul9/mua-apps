import { serviceAreaLabel } from "@/lib/site-config"
import type { MuaProfile } from "@/lib/api/types"

export const faqs = [
  {
    question: "Bagaimana cara memesan jadwal makeup?",
    answer: "Isi form booking dengan tanggal, waktu, lokasi, jumlah orang, dan layanan yang diinginkan. Kami akan menghubungi Anda untuk konfirmasi lanjutan.",
  },
  {
    question: "Apakah bisa makeup di lokasi klien?",
    answer: `Ketersediaan layanan di lokasi mengikuti area pelayanan dan jadwal. Saat ini area pelayanan kami adalah ${serviceAreaLabel}.`,
  },
  {
    question: "Berapa DP yang perlu dibayar?",
    answer: "Informasi nominal DP akan muncul setelah form booking berhasil dikirim. Jadwal dikonfirmasi setelah pembayaran diverifikasi oleh MUA.",
  },
  {
    question: "Apa yang perlu disiapkan sebelum makeup?",
    answer: "Sampaikan referensi, busana, kondisi kulit, dan alergi kosmetik sebelum hari acara. Datang atau bersiaplah dengan wajah bersih dan cukup istirahat.",
  },
] as const

export function getMuaFaqs(profile?: MuaProfile | null) {
  const areas =
    profile?.serviceArea?.filter(Boolean).join(", ") || serviceAreaLabel

  return faqs.map((faq) =>
    faq.question === "Apakah bisa makeup di lokasi klien?"
      ? {
          ...faq,
          answer: `Ketersediaan layanan di lokasi mengikuti area pelayanan dan jadwal. Area pelayanan ${profile?.brandName || "kami"} meliputi ${areas}.`,
        }
      : faq,
  )
}
