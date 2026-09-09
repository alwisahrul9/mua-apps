'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Clock, Info, CreditCard, User, Phone, MessageCircle, Copy, Check, Edit2 } from 'lucide-react'
import Link from 'next/link'

// You might want to define this type in a shared location later
type BookingDetail = {
  id: string
  clientName: string
  whatsapp: string
  instagram: string | null
  totalPerson: number
  eventName: string
  eventDate: Date
  eventTime: Date
  location: string
  notes: string | null
  paymentDeadline: Date
  customCode: string
  status: string
  totalPrice: number
  dpAmount: number
  createdAt: Date
  service: {
    name: string
    price: number
  }
}

export default function BookingModal({ booking }: { booking: BookingDetail }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const handleClose = () => {
    router.back()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'dp_paid': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'canceled':
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10">
            <div>
              <h2 className="text-2xl font-bold">Detail Booking</h2>
              <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark font-mono mt-1 text-sm">{booking.customCode || `#${booking.id}`}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-foreground/5 dark:bg-foreground-dark/5 dark:bg-foreground dark:bg-foreground-dark/5 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Left Column: Client & Event Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-3">Informasi Klien</h3>
                  <div className="space-y-3 bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Nama</p>
                        <p className="font-medium">{booking.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">WhatsApp</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{booking.whatsapp}</p>
                          <Link
                            href={`https://wa.me/${booking.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-md hover:bg-green-200 transition-colors"
                            title="Chat via WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Chat
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path fill="currentColor" fillRule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Instagram</p>
                        <div className="flex items-center gap-2">
                          {booking.instagram ? (
                            <>
                              <p className="font-medium">@{booking.instagram}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(booking.instagram!);
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                }}
                                className="p-1.5 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark hover:bg-muted-foreground/10 dark:bg-muted-foreground-dark/10 dark:bg-muted-foreground dark:bg-muted-foreground-dark/10 text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark rounded-md transition-colors"
                                title="Salin Username"
                              >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </>
                          ) : (
                            <p className="font-medium">-</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-3">Detail Acara</h3>
                  <div className="space-y-3 bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Nama Acara</p>
                        <p className="font-medium">{booking.eventName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Tanggal & Waktu</p>
                        <p className="font-medium">
                          {new Date(booking.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
                          {new Date(booking.eventTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark" />
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Lokasi</p>
                        <p className="font-medium line-clamp-2">{booking.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Service & Payment Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-3">Layanan</h3>
                  <div className="space-y-3 bg-primary/5 dark:bg-primary-dark/5 dark:bg-primary dark:bg-primary-dark/5 p-4 rounded-2xl border border-primary/20 dark:border-primary-dark/20 dark:border-primary dark:border-primary-dark/20">
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Paket Layanan</p>
                      <p className="font-semibold text-lg">{booking.service.name}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-primary/10 dark:border-primary-dark/10 dark:border-primary dark:border-primary-dark/10 pt-3">
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Jumlah Orang</p>
                      <p className="font-medium">{booking.totalPerson} Orang</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-3">Pembayaran</h3>
                  <div className="space-y-4 bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Status</p>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Total Harga</p>
                      <p className="font-semibold">{formatCurrency(booking.totalPrice)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">DP (Down Payment)</p>
                      <p className="font-medium text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark">{formatCurrency(booking.dpAmount)}</p>
                    </div>
                    <div className="border-t border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 pt-3 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Tenggat Waktu Bayar DP</p>
                        <p className="font-medium text-sm">
                          {new Date(booking.paymentDeadline).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider mb-2">Catatan Tambahan</h3>
                    <p className="text-sm bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-4 rounded-xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5 italic">
                      "{booking.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELED' && (
            <div className="p-6 border-t border-foreground/10 dark:border-foreground-dark/10 flex justify-end bg-muted/20 dark:bg-muted-dark/20">
              <button
                onClick={() => {
                  window.location.href = `/dashboard/bookings/${booking.id}/edit`
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90 rounded-xl font-medium transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Booking
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
