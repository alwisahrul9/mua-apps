"use server";

import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

const bookingSchema = z.object({
  clientName: z.string().min(1, "Nama lengkap harus diisi"),
  whatsapp: z
    .string()
    .min(11, "Nomor WhatsApp minimal 10 digit")
    .regex(/^08[0-9]+$/, "Nomor WhatsApp harus diawali dengan 08 dan hanya berisi angka"),
  instagram: z.string().optional(),
  totalPerson: z.coerce.number().min(1, "Jumlah orang minimal 1"),
  serviceId: z.string().min(1, "Layanan harus dipilih"),
  eventName: z.string().min(1, "Jenis acara harus diisi"),
  eventDate: z.string().min(1, "Tanggal acara harus diisi"),
  eventTime: z.string().min(1, "Waktu acara harus diisi"),
  location: z.string().min(1, "Lokasi harus diisi"),
  notes: z.string().optional(),
});

import { unstable_cache } from "next/cache";

const getCachedServices = unstable_cache(
  async () => {
    return await prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
  },
  ['services-list'],
  { tags: ['services'], revalidate: 3600 }
);

export async function getServices() {
  return await getCachedServices();
}

export async function createBooking(prevState: any, formData: FormData) {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Validasi gagal, mohon periksa kembali isian form Anda.",
      data: Object.fromEntries(formData.entries()),
    };
  }

  const data = parsed.data;

  // Convert date and time
  const [year, month, day] = data.eventDate.split('-');
  const [hour, minute] = data.eventTime.split(':');

  const eventDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));

  let customCode = "";

  try {
    // Fetch service price from database
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId, deletedAt: null }
    });

    if (!service) {
      return {
        message: "Layanan tidak ditemukan.",
        data: Object.fromEntries(formData.entries()),
      };
    }

    const price = service.price;

    const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    customCode = "BKG-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const findCode = await prisma.booking.findUnique({
      where: {
        customCode: customCode,
      },
    });

    if (findCode) {
      customCode = "BKG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const newBooking = await prisma.booking.create({
      data: {
        clientName: data.clientName.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        whatsapp: data.whatsapp.replace(/^0/, '62'),
        instagram: data.instagram ? data.instagram.replace(/@/g, '') : data.instagram,
        totalPerson: data.totalPerson,
        serviceId: data.serviceId,
        eventName: data.eventName,
        eventDate: eventDateTime,
        eventTime: eventDateTime,
        location: data.location,
        notes: data.notes,
        paymentDeadline: paymentDeadline,
        customCode: customCode,
        totalPrice: price * data.totalPerson,
        dpAmount: (price * data.totalPerson) * 0.3,
        status: 'PENDING'
      }
    });

    // Convert client name to title case
    const convertClientName = data.clientName.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    await prisma.notification.create({
      data: {
        title: "Booking Baru Diterima",
        message: `${convertClientName} baru saja membuat booking untuk acara ${data.eventName}.`,
        type: "new_booking",
        bookingId: newBooking.id,
      }
    });

  } catch (e: any) {
    console.error(e);
    return {
      message: "Gagal menyimpan data booking. " + e.message,
    };
  }

  // Next.js redirect must be called outside try/catch
  redirect(`/booking/success/${customCode}`);
}
