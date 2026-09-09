import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { StatusBooking } from '../generated/prisma/client'

async function main() {
  console.log('Start seeding...')

  await prisma.booking.deleteMany()
  await prisma.service.deleteMany()

  // Buat minimal 1 service jika belum ada, atau ambil service pertama
  let service = await prisma.service.findFirst()
  if (!service) {
    service = await prisma.service.create({
      data: {
        name: 'Wedding Package Dummy',
        description: 'Paket pernikahan lengkap',
        price: 5000000,
      },
    })
  }

  const statuses = [
    StatusBooking.PENDING,
    StatusBooking.DP_PAID,
    StatusBooking.COMPLETED,
    StatusBooking.CANCELED,
  ]
  const events = ['Wedding', 'Prewedding', 'Engagement', 'Graduation', 'Party']

  const bookingsData = []

  // Menyiapkan 300 data untuk bervariasi dari 2024 hingga 2026
  for (let i = 1; i <= 300; i++) {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomEvent = events[Math.floor(Math.random() * events.length)]

    // Generate random createdAt date between Jan 2024 and Dec 2026
    const start = new Date(2024, 0, 1).getTime()
    const end = new Date(2026, 11, 31).getTime()
    const randomTimestamp = new Date(start + Math.random() * (end - start))
    
    // eventDate is usually after createdAt (e.g., 1 to 6 months after)
    const eventDate = new Date(randomTimestamp)
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 180) + 10) // 10 to 190 days later

    const paymentDeadline = new Date(eventDate)
    paymentDeadline.setDate(paymentDeadline.getDate() - 7) // Deadline 7 hari sebelum acara

    bookingsData.push({
      clientName: `Client Dummy ${i}`,
      whatsapp: `6281234567${String(i).padStart(3, '0')}`,
      instagram: `@client_dummy_${i}`,
      totalPerson: Math.floor(Math.random() * 5) + 1,
      serviceId: service.id,
      eventName: randomEvent,
      eventDate: eventDate,
      eventTime: eventDate,
      createdAt: randomTimestamp,
      location: `Gedung Pernikahan Dummy ${i}`,
      notes: `Catatan tambahan untuk booking ke-${i}`,
      paymentDeadline: paymentDeadline,
      customCode: `MUA-DUMMY-${Date.now()}-${i}`,
      status: randomStatus,
      totalPrice: service.price,
      dpAmount: service.price * 0.2, // DP 20%
    })
  }

  console.log(`Menyiapkan 300 data booking dummy...`)

  // CreateMany untuk memasukkan data secara massal
  const result = await prisma.booking.createMany({
    data: bookingsData,
    skipDuplicates: true,
  })

  console.log(`Berhasil menambahkan ${result.count} data booking dummy!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
