import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import DashboardStatsChart from "./components/DashboardStatsChart"
import DashboardBarChart from "./components/DashboardBarChart"
import MonthRangeFilter from "./components/MonthRangeFilter"

export const dynamic = "force-dynamic"

import { Suspense } from "react"
import DashboardSkeleton from "./components/DashboardSkeleton"

// Helper function to format display suffix
function getDisplayTitleSuffix(start: string | undefined, end: string | undefined, currentYear: number) {
  if (!start && !end) return `(Tahun ${currentYear})`

  const formatMonthYear = (str: string) => {
    const [y, m] = str.split('-')
    const date = new Date(Number(y), Number(m) - 1, 1)
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }

  if (start && end) {
    if (start === end) return `(${formatMonthYear(start)})`
    return `(${formatMonthYear(start)} - ${formatMonthYear(end)})`
  } else if (start) {
    return `(Mulai ${formatMonthYear(start)})`
  } else if (end) {
    return `(Hingga ${formatMonthYear(end)})`
  }
  return ''
}

async function DashboardData({ searchParams }: { searchParams: any }) {
  const currentYear = new Date().getFullYear()

  // Parsing query parameters safely
  const params = await searchParams
  const startMonthParam = params?.start as string | undefined
  const endMonthParam = params?.end as string | undefined

  let startObj: Date | null = null
  let endObj: Date | null = null

  if (startMonthParam) {
    const [y, m] = startMonthParam.split('-').map(Number)
    startObj = new Date(Date.UTC(y, m - 1, 1))
  }

  if (endMonthParam) {
    const [y, m] = endMonthParam.split('-').map(Number)
    endObj = new Date(Date.UTC(y, m, 1)) // 1st day of next month
  }

  // Build raw query conditions safely using Prisma.sql
  const conditions = []

  if (startObj) {
    conditions.push(Prisma.sql`"createdAt" >= ${startObj}`)
  }

  if (endObj) {
    conditions.push(Prisma.sql`"createdAt" < ${endObj}`)
  }

  if (!startObj && !endObj) {
    conditions.push(Prisma.sql`EXTRACT(YEAR FROM "createdAt") = ${currentYear}`)
  }

  const whereClause = Prisma.join(conditions, ' AND ')

  // 1. Total bookings
  const totalBookingsQuery = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(id) as count 
    FROM bookings 
    WHERE ${whereClause}
  `
  const totalBookings = Number(totalBookingsQuery[0]?.count || 0)

  // 2. Total income for COMPLETED bookings
  const totalIncomeQuery = await prisma.$queryRaw<{ sum: bigint }[]>`
    SELECT SUM("totalPrice") as sum 
    FROM bookings 
    WHERE status::text = 'COMPLETED'
    AND ${whereClause}
  `
  const totalIncome = Number(totalIncomeQuery[0]?.sum || 0)

  // 3. Status distribution
  const statusCountsQuery = await prisma.$queryRaw<{ status: string, count: bigint }[]>`
    SELECT status::text as status, COUNT(id) as count 
    FROM bookings 
    WHERE ${whereClause}
    GROUP BY status
  `

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Prepare Pie Chart data
  const pieChartData = statusCountsQuery.map(row => ({
    name: row.status,
    value: Number(row.count)
  }))

  // 4. Bar Chart Query (Always run)
  const monthlyStatsQuery = await prisma.$queryRaw<{ year: number, month: number, count: bigint, sum: bigint }[]>`
    SELECT 
      EXTRACT(YEAR FROM "createdAt") as year,
      EXTRACT(MONTH FROM "createdAt") as month, 
      COUNT(id) as count,
      SUM(CASE WHEN status::text = 'COMPLETED' THEN "totalPrice" ELSE 0 END) as sum
    FROM bookings
    WHERE ${whereClause}
    GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
    ORDER BY year ASC, month ASC
  `
  let barChartData = monthlyStatsQuery.map(row => ({
    year: Number(row.year),
    month: Number(row.month),
    bookingCount: Number(row.count),
    income: Number(row.sum || 0)
  }))

  // 5. 5 Booking terbaru (syncing Prisma ORM query with raw query filters)
  let prismaWhere: any = {}

  if (startObj || endObj) {
    prismaWhere.createdAt = {}
    if (startObj) prismaWhere.createdAt.gte = startObj
    if (endObj) prismaWhere.createdAt.lt = endObj
  } else {
    prismaWhere.createdAt = {
      gte: new Date(Date.UTC(currentYear, 0, 1)),
      lt: new Date(Date.UTC(currentYear + 1, 0, 1))
    }
  }

  const latestBookings = await prisma.booking.findMany({
    where: prismaWhere,
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      clientName: true,
      customCode: true,
      status: true,
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-medium">Pending</span>
      case 'DP_PAID':
        return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-medium">DP Paid</span>
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">Completed</span>
      case 'CANCELED':
        return <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">Canceled</span>
      default:
        return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const displayTitleSuffix = getDisplayTitleSuffix(startMonthParam, endMonthParam, currentYear)
  const barChartWidth = Math.max(600, barChartData.length * 60)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Booking {displayTitleSuffix}</h3>
          <p className="text-3xl font-bold">{totalBookings}</p>
        </div>
        <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Pendapatan (COMPLETED) {displayTitleSuffix}</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
      </div>

      <div className="mt-8 bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="flex flex-col lg:col-span-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Persentase Status Booking {displayTitleSuffix}</h3>
            <div className="h-[300px] flex-grow">
              <DashboardStatsChart data={pieChartData} />
            </div>
          </div>

          <div className="flex flex-col lg:col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">5 Booking Terbaru {displayTitleSuffix}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg rounded-bl-lg">Kode</th>
                    <th className="px-4 py-3 font-medium">Klien</th>
                    <th className="px-4 py-3 font-medium rounded-tr-lg rounded-br-lg text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {latestBookings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        Belum ada booking
                      </td>
                    </tr>
                  ) : (
                    latestBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{b.customCode}</td>
                        <td className="px-4 py-3 truncate max-w-[120px]" title={b.clientName}>{b.clientName}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">{getStatusBadge(b.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {barChartData.length > 0 && (
        <div className="mt-8 bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Statistik Per Bulan {displayTitleSuffix}</h3>
          <div className="overflow-x-auto">
            <div className="h-[400px]" style={{ minWidth: `${barChartWidth}px` }}>
              <DashboardBarChart data={barChartData} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: any
}) {
  const params = await searchParams
  const key = `${params?.start || ''}-${params?.end || ''}`

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif">Selamat Datang di Dashboard</h1>
      <p className="text-muted-foreground">
        Ini adalah statistik pesanan Anda.
      </p>

      {/* Filter Section */}
      <MonthRangeFilter />

      <Suspense key={key} fallback={<DashboardSkeleton />}>
        <DashboardData searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
