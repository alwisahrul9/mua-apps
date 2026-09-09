"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

const portfolioSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").transform(toTitleCase),
  category: z.enum(["Pertunangan", "Wisuda", "Photoshoot"], {
    message: "Pilih kategori yang valid",
  }),
  altText: z.string().min(3, "Alt text minimal 3 karakter untuk keperluan SEO").transform(toTitleCase),
  imagePath: z.string().min(1, "Path gambar wajib diisi"),
})

export async function createPortfolio(prevState: any, formData: FormData) {
  const rawImagePath = formData.get("imagePath") as string | null

  // Fungsi helper untuk menghapus gambar yang sudah terlanjur di-upload jika terjadi error
  const cleanupImage = async () => {
    if (rawImagePath) {
      try {
        const supabase = await createClient()
        await supabase.storage.from('portfolios').remove([rawImagePath])
      } catch (error) {
        console.error("Failed to cleanup image:", error)
      }
    }
  }

  // Check limit first
  const count = await prisma.portfolio.count()
  if (count >= 9) {
    await cleanupImage()
    return { error: "Batas maksimum portofolio telah tercapai (9 data). Anda tidak dapat menambah data lagi." }
  }

  const validatedFields = portfolioSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    altText: formData.get("altText"),
    imagePath: rawImagePath,
  })

  if (!validatedFields.success) {
    await cleanupImage()
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      error: "Terdapat kesalahan pada isian form Anda. Silakan periksa kembali."
    }
  }

  const { title, category, altText, imagePath } = validatedFields.data

  const supabase = await createClient()

  const { data: { publicUrl } } = supabase.storage
    .from('portfolios')
    .getPublicUrl(imagePath)

  try {
    await prisma.portfolio.create({
      data: {
        title,
        category,
        altText,
        imageUrl: publicUrl
      }
    })
  } catch (error) {
    console.error("Database error:", error)
    await cleanupImage()
    return { error: "Terjadi kesalahan saat menyimpan data ke database." }
  }

  redirect("/dashboard/portfolios")
}

export async function deletePortfolio(id: string) {
  try {
    // 1. Cari portfolio untuk mendapatkan imageUrl
    const portfolio = await prisma.portfolio.findUnique({
      where: { id }
    })

    if (!portfolio) {
      return { error: "Portofolio tidak ditemukan." }
    }

    // 2. Hapus data dari database TERLEBIH DAHULU untuk memastikan konsistensi
    await prisma.portfolio.delete({
      where: { id }
    })

    // 3. Jika database berhasil dihapus, barulah kita hapus gambar dari Supabase
    // Ekstrak path dari imageUrl (contoh: https://.../portfolios/nama-file.jpg -> nama-file.jpg)
    const urlParts = portfolio.imageUrl.split('/portfolios/')
    if (urlParts.length > 1) {
      const imagePath = urlParts[1]
      const supabase = await createClient()
      
      const { error: storageError } = await supabase.storage
        .from('portfolios')
        .remove([imagePath])

      if (storageError) {
        console.error("Failed to delete image from storage:", storageError)
        // Kita tidak mereturn error karena data di DB sudah berhasil terhapus
        // Ini memastikan konsistensi prioritas database
      }
    }

  } catch (error) {
    console.error("Delete portfolio error:", error)
    return { error: "Terjadi kesalahan saat menghapus data." }
  }

  redirect("/dashboard/portfolios")
}
