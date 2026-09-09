"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

const serviceSchema = z.object({
  name: z.string().min(1, "Nama layanan wajib diisi").transform(toTitleCase),
  price: z.coerce.number().min(0, "Harga layanan minimal 0"),
  description: z.string().optional(),
  iconName: z.string().min(1, "Ikon wajib dipilih"),
})

export async function createService(prevState: any, formData: FormData) {
  const validatedFields = serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    description: formData.get("description"),
    iconName: formData.get("iconName"),
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { name, price, description, iconName } = validatedFields.data

  await prisma.service.create({
    data: {
      name,
      description: description || null,
      price,
      iconName,
    },
  })

  revalidatePath("/dashboard/services")
  updateTag("services")
  revalidatePath("/")
  revalidatePath("/booking")
  redirect("/dashboard/services")
}

export async function updateService(id: string, prevState: any, formData: FormData) {
  const validatedFields = serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    description: formData.get("description"),
    iconName: formData.get("iconName"),
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { name, price, description, iconName } = validatedFields.data

  await prisma.service.update({
    where: { id },
    data: {
      name,
      description: description || null,
      price,
      iconName,
    },
  })

  revalidatePath("/dashboard/services")
  updateTag("services")
  revalidatePath("/")
  revalidatePath("/booking")
  redirect("/dashboard/services")
}

export async function deleteService(id: string) {
  await prisma.service.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  revalidatePath("/dashboard/services")
  updateTag("services")
  revalidatePath("/")
  revalidatePath("/booking")
  redirect("/dashboard/services")
}
