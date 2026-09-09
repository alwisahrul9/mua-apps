import { getBookingDetail } from '../../actions'
import BookingModal from '../../components/BookingModal'

export default async function BookingModalPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { data, error } = await getBookingDetail(params.id)

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark p-6 rounded-2xl max-w-sm w-full text-center">
          <p className="text-red-500 font-medium">Data tidak ditemukan atau terjadi kesalahan.</p>
        </div>
      </div>
    )
  }

  // Type casting needed because prisma relation typing might differ slightly 
  // from our component prop types without explicit mapping, but it should match structurally.
  return <BookingModal booking={data as any} />
}
