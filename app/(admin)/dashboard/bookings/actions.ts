'use server'

import { prisma } from '@/lib/prisma'
import { Prisma, StatusBooking } from '@/generated/prisma/client'

export async function getBookings(skip: number = 0, take: number = 10, searchQuery?: string, statusFilter?: string) {
  try {
    const whereClause: Prisma.BookingWhereInput = {}

    if (searchQuery) {
      whereClause.OR = [
        { clientName: { contains: searchQuery, mode: 'insensitive' } },
        { customCode: { contains: searchQuery, mode: 'insensitive' } }
      ]
    }

    if (statusFilter && statusFilter !== 'all') {
      whereClause.status = statusFilter as StatusBooking
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        clientName: true,
        customCode: true,
        status: true,
        createdAt: true,
      },
    })
    return { data: bookings }
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return { error: 'Failed to fetch bookings' }
  }
}

export async function getBookingDetail(id: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true
      }
    })

    if (!booking) return { error: 'Booking not found' }

    return { data: booking }
  } catch (error) {
    console.error('Failed to fetch booking detail:', error)
    return { error: 'Failed to fetch booking detail' }
  }
}

import { revalidatePath } from 'next/cache'

export async function updateBookingStatusAndSchedule(id: string, data: { status: StatusBooking, eventDate: Date, eventTime: Date }) {
  try {
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: data.status,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
      }
    })
    revalidatePath('/dashboard')
    return { data: updated }
  } catch (error) {
    console.error('Failed to update booking:', error)
    return { error: 'Failed to update booking' }
  }
}
