import { listBookings } from "@/lib/api/dashboard"
import DashboardStatsChart from "./components/DashboardStatsChart"
import DashboardBarChart from "./components/DashboardBarChart"
import MonthRangeFilter from "./components/MonthRangeFilter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600",
  DP_PAID: "bg-blue-500/10 text-blue-600",
  COMPLETED: "bg-green-500/10 text-green-600",
  CANCELED: "bg-red-500/10 text-red-600",
}

export default async function DashboardOverview({ searchParams }: { searchParams: Promise<{ start?: string; end?: string }> }) {
  const params = await searchParams
  const result = await listBookings({ per_page: 500 })
  const start = params.start ? new Date(`${params.start}-01T00:00:00+07:00`) : null
  const end = params.end ? new Date(`${params.end}-01T00:00:00+07:00`) : null
  if (end) end.setMonth(end.getMonth() + 1)

  const bookings = result.data.filter((booking) => {
    const createdAt = new Date(booking.createdAt)
    return (!start || createdAt >= start) && (!end || createdAt < end)
  })
  const totalIncome = bookings.filter((booking) => booking.status === "COMPLETED").reduce((sum, booking) => sum + booking.totalPrice, 0)
  const statuses = ["PENDING", "DP_PAID", "COMPLETED", "CANCELED"].map((name) => ({
    name,
    value: bookings.filter((booking) => booking.status === name).length,
  }))
  const monthly = new Map<string, { year: number; month: number; bookingCount: number; income: number }>()
  for (const booking of bookings) {
    const date = new Date(booking.createdAt)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    const item = monthly.get(key) ?? { year: date.getFullYear(), month: date.getMonth() + 1, bookingCount: 0, income: 0 }
    item.bookingCount += 1
    if (booking.status === "COMPLETED") item.income += booking.totalPrice
    monthly.set(key, item)
  }
  const latestBookings = [...bookings].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif">Selamat Datang di Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Ringkasan performa dan pesanan bisnis MUA Anda.</p>
      </div>
      <MonthRangeFilter />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Booking</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{bookings.length}</p></CardContent></Card>
        <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm text-muted-foreground">Pendapatan Selesai</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalIncome)}</p></CardContent></Card>
      </div>

      <div className="grid gap-8 rounded-2xl border bg-background p-6 lg:grid-cols-5 dark:bg-background-dark">
        <div className="lg:col-span-3"><h2 className="mb-4 text-sm font-medium text-muted-foreground">Status Booking</h2><div className="h-[300px]"><DashboardStatsChart data={statuses} /></div></div>
        <div className="lg:col-span-2"><h2 className="mb-4 text-sm font-medium text-muted-foreground">5 Booking Terbaru</h2><Table><TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Klien</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{latestBookings.map((booking) => <TableRow key={booking.id}><TableCell>{booking.customCode}</TableCell><TableCell>{booking.clientName}</TableCell><TableCell><Badge className={statusClass[booking.status]}>{booking.status.replace("_", " ")}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
      </div>

      {monthly.size > 0 && <div className="min-w-0 rounded-2xl border bg-background p-4 sm:p-6 dark:bg-background-dark"><h2 className="mb-4 text-sm font-medium text-muted-foreground">Statistik Per Bulan</h2><div className="h-[400px] min-w-0"><DashboardBarChart data={[...monthly.values()]} /></div></div>}
    </div>
  )
}
