"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { apiErrorMessage } from "@/lib/api/client"
import { listPortfolios } from "@/lib/api/dashboard"
import { serverApi } from "@/lib/api/server"

const portfolioSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  altText: z.string().min(1, "Alt text wajib diisi"),
  imageUrl: z.string().url("Gambar wajib diunggah terlebih dahulu"),
})

export async function checkPortfolioLimit() {
  try {
    return (await listPortfolios()).length >= 9
      ? { error: "Batas maksimal 9 portofolio telah tercapai." }
      : { success: true }
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal memeriksa batas portofolio.") }
  }
}

export async function createPortfolio(_previousState: unknown, formData: FormData) {
  const parsed = portfolioSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    altText: formData.get("altText"),
    imageUrl: formData.get("imageUrl"),
  })
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  try {
    await (await serverApi()).post("/dashboard/portfolios", {
      title: parsed.data.title,
      category: parsed.data.category,
      alt_text: parsed.data.altText,
      image_url: parsed.data.imageUrl,
    })
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal menyimpan portofolio.") }
  }

  revalidatePath("/dashboard/portfolios")
  redirect("/dashboard/portfolios?toast=Portofolio%20berhasil%20ditambahkan")
}

export async function deletePendingPortfolioImage(url: string) {
  const parsed = portfolioSchema.shape.imageUrl.safeParse(url)
  if (!parsed.success) {
    return { error: "URL gambar portofolio tidak valid." }
  }

  try {
    await (await serverApi()).delete("/dashboard/media/portfolio-image", {
      data: { url: parsed.data },
    })
    return { success: "Gambar portofolio berhasil dihapus." }
  } catch (error) {
    return {
      error: apiErrorMessage(
        error,
        "Gambar portofolio gagal dihapus. Silakan coba lagi.",
      ),
    }
  }
}

export async function deletePortfolio(id: string) {
  try {
    await (await serverApi()).delete(`/dashboard/portfolios/${encodeURIComponent(id)}`)
  } catch (error) {
    return { error: apiErrorMessage(error, "Gagal menghapus portofolio.") }
  }
  revalidatePath("/dashboard/portfolios")
  redirect("/dashboard/portfolios?toast=Portofolio%20berhasil%20dihapus")
}
