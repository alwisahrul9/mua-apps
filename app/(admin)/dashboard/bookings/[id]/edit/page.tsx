import { getBookingDetail } from '../../actions'
import { redirect } from 'next/navigation'
import EditBookingForm from './EditBookingForm'

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: booking, error } = await getBookingDetail(id)

  if (error || !booking) {
    redirect('/dashboard/bookings')
  }

  if (booking.status === 'COMPLETED' || booking.status === 'CANCELED') {
    redirect('/dashboard/bookings')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <EditBookingForm booking={booking} />
    </div>
  )
}
