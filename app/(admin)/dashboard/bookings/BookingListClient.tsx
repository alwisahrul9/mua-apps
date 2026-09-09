'use client'

import { useState, useRef, useCallback } from 'react'
import { getBookings } from './actions'
import { Loader2, Search, Filter } from 'lucide-react'
import Link from 'next/link'

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
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeSearch, setActiveSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

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

    const { data } = await getBookings(0, 10, searchQuery, statusFilter)

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
    const { data } = await getBookings(nextSkip, 10, activeSearch, activeFilter)

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
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark" />
          <input
            type="text"
            placeholder="Cari nama klien atau kode booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-foreground/20 dark:border-foreground-dark/20 dark:border-foreground dark:border-foreground-dark/20 bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary/50 dark:ring-primary-dark/50 dark:ring-primary dark:ring-primary-dark/50 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-foreground/20 dark:border-foreground-dark/20 dark:border-foreground dark:border-foreground-dark/20 bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary/50 dark:ring-primary-dark/50 dark:ring-primary dark:ring-primary-dark/50 transition-all appearance-none"
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="DP_PAID">DP Paid</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-primary dark:bg-primary-dark dark:bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark dark:text-primary-foreground dark:text-primary-foreground-dark px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Cari
          </button>
        </div>
      </div>

      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 p-5 rounded-2xl shadow-sm h-[150px] flex flex-col justify-between">
              <div>
                <div className="h-6 w-3/4 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md mb-2"></div>
                <div className="h-4 w-1/2 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
              </div>
              <div className="pt-4 border-t border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5 mt-auto">
                <div className="h-3 w-1/2 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md mb-3"></div>
                <div className="h-6 w-24 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-full"></div>
              </div>
            </div>
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
                className="block"
                ref={isLastElement ? lastBookingElementRef : null}
              >
                <div
                  className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1" title={booking.clientName}>
                        {booking.clientName}
                      </h3>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mt-1 font-mono">
                        {booking.customCode || `#${booking.id}`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5 mt-auto">
                    <p className="text-xs mb-3 text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                      Dibuat pada: {new Date(booking.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
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
