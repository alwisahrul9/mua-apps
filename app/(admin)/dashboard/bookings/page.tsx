import { getBookings } from './actions'
import BookingListClient from './BookingListClient'

export default async function BookingsPage() {
  const { data: initialBookings } = await getBookings(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif mb-1">Daftar Booking</h1>
          <p className="text-muted-foreground">Kelola semua jadwal booking Anda di sini.</p>
        </div>
      </div>

      <BookingListClient initialBookings={initialBookings || []} />
    </div>
  )
}
