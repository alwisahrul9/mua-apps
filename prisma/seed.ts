import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { StatusBooking } from '../generated/prisma/client'

async function main() {
  console.log('Start seeding...')

  await prisma.notification.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.service.deleteMany()
  await prisma.portfolio.deleteMany()

  // 1. Setup 3 Services
  console.log('Menyiapkan 3 data service dummy...')
  const servicesData = [
    {
      name: 'Wedding Package',
      description: 'Paket rias pengantin lengkap dengan gaun dan dokumentasi.',
      price: 5000000,
      iconName: 'Sparkles',
    },
    {
      name: 'Wisuda / Graduation',
      description: 'Tampil cantik maksimal di hari kelulusan Anda.',
      price: 500000,
      iconName: 'GraduationCap',
    },
    {
      name: 'Photoshoot Session',
      description: 'Makeup profesional untuk berbagai kebutuhan sesi foto.',
      price: 1000000,
      iconName: 'Camera',
    },
  ]

  const createdServices = []
  for (const s of servicesData) {
    const service = await prisma.service.create({ data: s })
    createdServices.push(service)
  }
  console.log(`Berhasil menambahkan 3 data service!`)

  // 2. Setup 9 Portfolios
  console.log('Menyiapkan 9 data portfolio dummy...')
  const portfoliosData = [
    {
      title: 'Elegance Wedding',
      category: 'wedding',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
      altText: 'Elegance Wedding Makeup',
    },
    {
      title: 'Traditional Wedding',
      category: 'wedding',
      imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop',
      altText: 'Traditional Wedding Makeup',
    },
    {
      title: 'Modern Bride',
      category: 'wedding',
      imageUrl: 'https://images.unsplash.com/photo-1596450514735-a6e5b512c1c3?q=80&w=600&auto=format&fit=crop',
      altText: 'Modern Bride Makeup',
    },
    {
      title: 'Graduation Look 1',
      category: 'wisuda',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop',
      altText: 'Natural Graduation Makeup',
    },
    {
      title: 'Graduation Look 2',
      category: 'wisuda',
      imageUrl: 'https://images.unsplash.com/photo-1627556592933-ffe99c1c9dd0?q=80&w=600&auto=format&fit=crop',
      altText: 'Bold Graduation Makeup',
    },
    {
      title: 'Graduation Look 3',
      category: 'wisuda',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop',
      altText: 'Elegant Graduation Makeup',
    },
    {
      title: 'Beauty Photoshoot',
      category: 'photoshoot',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
      altText: 'Beauty Photoshoot Makeup',
    },
    {
      title: 'Fashion Editorial',
      category: 'photoshoot',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      altText: 'Fashion Editorial Makeup',
    },
    {
      title: 'Glamour Look',
      category: 'photoshoot',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
      altText: 'Glamour Photoshoot Makeup',
    },
  ]

  await prisma.portfolio.createMany({
    data: portfoliosData,
  })
  console.log(`Berhasil menambahkan 9 data portfolio!`)

  // 3. Setup 300 Bookings
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
    const randomService = createdServices[Math.floor(Math.random() * createdServices.length)]

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
      instagram: `client_dummy_${i}`,
      totalPerson: Math.floor(Math.random() * 5) + 1,
      serviceId: randomService.id,
      eventName: randomEvent,
      eventDate: eventDate,
      eventTime: eventDate,
      createdAt: randomTimestamp,
      location: `Gedung Acara Dummy ${i}`,
      notes: `Catatan tambahan untuk booking ke-${i}`,
      paymentDeadline: paymentDeadline,
      customCode: `MUA-DUMMY-${Date.now()}-${i}`,
      status: randomStatus,
      totalPrice: randomService.price,
      dpAmount: randomService.price * 0.2, // DP 20%
    })
  }

  console.log(`Menyiapkan 300 data booking dummy...`)

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
