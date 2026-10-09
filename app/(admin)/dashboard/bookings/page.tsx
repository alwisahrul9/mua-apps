import { getBookings } from './actions'
import BookingListClient from './BookingListClient'

export default async function BookingsPage() {
  const initialResult = await getBookings(1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif mb-1">Daftar Booking</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Kelola semua jadwal booking Anda di sini.</p>
        </div>
      </div>

      <BookingListClient
        initialBookings={initialResult.data}
        initialPage={initialResult.currentPage}
        initialLastPage={initialResult.lastPage}
      />
    </div>
  )
}
