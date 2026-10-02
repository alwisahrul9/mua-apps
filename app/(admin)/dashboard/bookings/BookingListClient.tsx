'use client'

import { useState, useRef, useCallback } from 'react'
import { getBookings } from './actions'
import { Loader2, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BookingItem = {
  id: string
  clientName: string
  customCode: string | null
  status: string
  createdAt: Date
}

export default function BookingListClient({ initialBookings }: { initialBookings: BookingItem[] }) {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [hasMore, setHasMore] = useState(initialBookings.length === 10)

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [activeSearch, setActiveSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('Semua Status')

  const mapStatusToApi = (status: string) => {
    switch (status) {
      case 'Pending': return 'PENDING'
      case 'DP Paid': return 'DP_PAID'
      case 'Completed': return 'COMPLETED'
      case 'Canceled': return 'CANCELED'
      case 'Semua Status':
      default: return 'all'
    }
  }

  const observer = useRef<IntersectionObserver | null>(null)
  const lastBookingElementRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      if (loading || isSearching) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreBookings()
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, isSearching, hasMore]
  )

  const handleSearch = async () => {
    setIsSearching(true)
    setActiveSearch(searchQuery)
    setActiveFilter(statusFilter)

    const apiFilter = mapStatusToApi(statusFilter)
    const { data } = await getBookings(0, 10, searchQuery, apiFilter)

    if (data) {
      setBookings(data)
      setPage(1)
      setHasMore(data.length === 10)
    }
    setIsSearching(false)
  }

  const loadMoreBookings = async () => {
    setLoading(true)
    const nextSkip = page * 10
    const apiFilter = mapStatusToApi(activeFilter)
    const { data } = await getBookings(nextSkip, 10, activeSearch, apiFilter)

    if (data) {
      setBookings((prev) => [...prev, ...data])
      setPage((prev) => prev + 1)
      if (data.length < 10) {
        setHasMore(false)
      }
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'dp_paid':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground dark:text-muted-foreground-dark" />
          <Input
            type="text"
            placeholder="Cari nama klien atau kode booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-xl bg-background dark:bg-background-dark focus-visible:ring-primary/50 dark:focus-visible:ring-primary-dark/50"
          />
        </div>
        <div className="flex gap-4 justify-center items-center w-full md:w-auto">
          <div className="flex-1 md:flex-none md:w-[180px] lg:w-[200px]">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'Semua Status')}>
              <SelectTrigger className="h-11 rounded-xl bg-background dark:bg-background-dark focus:ring-primary/50 dark:focus:ring-primary-dark/50">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground dark:text-muted-foreground-dark" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua Status">Semua Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="DP Paid">DP Paid</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-11 px-6 rounded-xl bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark hover:opacity-90 transition-opacity"
          >
            Cari
          </Button>
        </div>
      </div>

      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="h-[160px] flex flex-col justify-between border-foreground/10 dark:border-foreground-dark/10 shadow-sm bg-background dark:bg-background-dark rounded-2xl">
              <CardHeader className="pb-0 pt-5 px-5">
                <div className="h-6 w-3/4 bg-muted/60 dark:bg-muted-dark/60 rounded-md mb-2"></div>
                <div className="h-4 w-1/2 bg-muted/60 dark:bg-muted-dark/60 rounded-md"></div>
              </CardHeader>
              <CardFooter className="pt-4 border-t border-foreground/5 dark:border-foreground-dark/5 mt-auto flex-col items-start gap-3 pb-5 px-5">
                <div className="h-3 w-1/2 bg-muted/60 dark:bg-muted-dark/60 rounded-md"></div>
                <div className="h-6 w-24 bg-muted/60 dark:bg-muted-dark/60 rounded-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-8 text-center bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark rounded-2xl border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10">
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Tidak ada data booking yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking, index) => {
            const isLastElement = bookings.length === index + 1
            return (
              <Link
                href={`/dashboard/bookings/${booking.id}`}
                key={index}
                className="block h-full"
                ref={isLastElement ? lastBookingElementRef : null}
              >
                <Card className="h-full flex flex-col border-foreground/10 dark:border-foreground-dark/10 shadow-sm hover:shadow-md transition-shadow bg-background dark:bg-background-dark rounded-2xl">
                  <CardDescription className="px-5">
                    <CardTitle className="font-semibold text-lg line-clamp-1" title={booking.clientName}>
                      {booking.clientName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark mt-1 font-mono">
                      {booking.customCode || `#${booking.id}`}
                    </p>
                  </CardDescription>

                  <CardFooter className="pt-4 border-t border-foreground/5 dark:border-foreground-dark/5 mt-auto flex-col items-start pb-5 px-5">
                    <p className="text-xs mb-3 text-muted-foreground dark:text-muted-foreground-dark">
                      Dibuat pada: {new Date(booking.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'Asia/Jakarta'
                      })}
                    </p>
                    <Badge variant="outline" className={`${getStatusColor(booking.status)} uppercase tracking-wider font-medium text-xs px-2.5 py-1 rounded-full`}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {loading && !isSearching && (
        <div className="flex justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
        </div>
      )}

      {!hasMore && bookings.length > 0 && !isSearching && (
        <div className="text-center py-6 text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark pb-24 md:pb-6">
          Semua data booking telah ditampilkan.
        </div>
      )}
    </div>
  )
}
