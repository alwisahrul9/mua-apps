'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBookingStatusAndSchedule } from '../../actions'
import { ArrowLeft, Save, Loader2, Calendar, Clock, MessageCircle, Copy, Check } from 'lucide-react'
import { StatusBooking } from '@/generated/prisma/client'

export default function EditBookingForm({ booking }: { booking: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StatusBooking>(booking.status)
  const [copied, setCopied] = useState(false)

  // Format dates for input type="date" and type="time"
  const initialDate = new Date(booking.eventDate).toISOString().split('T')[0]
  const initialTime = new Date(booking.eventTime).toTimeString().substring(0, 5) // "HH:mm"

  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Combine date and time
    const eventDateObj = new Date(`${date}T00:00:00`)
    const eventTimeObj = new Date(`${date}T${time}:00`)

    const res = await updateBookingStatusAndSchedule(booking.id, {
      status,
      eventDate: eventDateObj,
      eventTime: eventTimeObj
    })

    setLoading(false)
    if (!res.error) {
      router.push('/dashboard/bookings')
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm space-y-8">
      {/* Read-only Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border border-foreground/5">
        <div>
          <p className="text-sm text-muted-foreground">Nama Klien</p>
          <p className="font-medium text-lg">{booking.clientName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">No. WhatsApp</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">{booking.whatsapp}</p>
            <a
              href={`https://wa.me/${booking.whatsapp.replace(/^0/, '62')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium hover:bg-green-200 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Hubungi
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Instagram</p>
          <div className="flex items-center gap-2">
            {booking.instagram ? (
              <>
                <p className="font-medium">@{booking.instagram || '-'}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(booking.instagram!)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-medium hover:bg-blue-200 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Tersalin' : 'Salin'}
                </button>
              </>
            ) : (
              <p className="font-medium">-</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Jumlah Orang</p>
          <p className="font-medium">{booking.totalPerson} Orang</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Layanan</p>
          <p className="font-medium">{booking.service.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Jenis Acara</p>
          <p className="font-medium">{booking.eventName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Harga</p>
          <p className="font-medium">Rp {booking.totalPrice.toLocaleString('id-ID')}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Lokasi</p>
          <p className="font-medium">{booking.location}</p>
        </div>
        {booking.notes && (
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">Catatan Tambahan</p>
            <p className="font-medium bg-background p-3 rounded-lg border border-foreground/10 mt-1">{booking.notes}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b border-foreground/10 pb-2">Edit Data</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Booking</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusBooking)}
                className="w-full px-4 py-2.5 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="PENDING">Pending</option>
                <option value="DP_PAID">DP Paid</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Acara</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Waktu Acara</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-foreground/10">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-foreground/20 rounded-xl font-medium hover:bg-muted transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}
