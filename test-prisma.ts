import { getBookings } from './app/(admin)/dashboard/bookings/actions'

async function run() {
  const res = await getBookings(0, 10)
  console.log(res)
}

run()
