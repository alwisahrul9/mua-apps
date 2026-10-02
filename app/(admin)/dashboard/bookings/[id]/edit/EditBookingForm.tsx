'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBookingStatusAndSchedule } from '../../actions'
import { ArrowLeft, Save, Loader2, Calendar, Clock, MessageCircle, Copy, Check } from 'lucide-react'
import { StatusBooking } from '@/generated/prisma/client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function EditBookingForm({ booking }: { booking: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const mapStatusToDisplay = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending'
      case 'DP_PAID': return 'DP Paid'
      case 'COMPLETED': return 'Completed'
      case 'CANCELED': return 'Canceled'
      default: return 'Pending'
    }
  }

  const mapDisplayToStatus = (display: string): StatusBooking => {
    switch (display) {
      case 'Pending': return 'PENDING'
      case 'DP Paid': return 'DP_PAID'
      case 'Completed': return 'COMPLETED'
      case 'Canceled': return 'CANCELED'
      default: return 'PENDING'
    }
  }

  const [displayStatus, setDisplayStatus] = useState<string>(mapStatusToDisplay(booking.status))
  const [copied, setCopied] = useState(false)

  // Format dates for input type="date" and type="time" enforcing WIB timezone
  const initialDate = new Date(booking.eventDate).toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }) // "YYYY-MM-DD"
  const initialTime = new Date(booking.eventTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) // "HH:mm"

  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Combine date and time (enforcing WIB timezone)
    const eventDateObj = new Date(`${date}T00:00:00+07:00`)
    const eventTimeObj = new Date(`${date}T${time}:00+07:00`)

    const res = await updateBookingStatusAndSchedule(booking.id, {
      status: mapDisplayToStatus(displayStatus),
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
    <>
      <div className="flex items-center flex-wrap gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => router.push("/dashboard/bookings")}
          className="h-10 px-4 rounded-xl border-foreground/20 dark:border-foreground-dark/20 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-serif">Edit Booking</h1>
      </div>
      <Card className="rounded-2xl border-foreground/10 dark:border-foreground-dark/10 shadow-sm bg-background dark:bg-background-dark">
        <CardContent className="p-6 space-y-8">
          {/* Read-only Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-6 rounded-xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Nama Klien</p>
              <p className="font-medium text-lg">{booking.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">No. WhatsApp</p>
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
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Instagram</p>
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
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Jumlah Orang</p>
              <p className="font-medium">{booking.totalPerson} Orang</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Layanan</p>
              <p className="font-medium">{booking.service.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Jenis Acara</p>
              <p className="font-medium">{booking.eventName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Total Harga</p>
              <p className="font-medium">Rp {booking.totalPrice.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Lokasi</p>
              <p className="font-medium">{booking.location}</p>
            </div>
            {booking.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Catatan Tambahan</p>
                <p className="font-medium bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark p-3 rounded-lg border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 mt-1">{booking.notes}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 pb-2">Edit Data</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Status Booking</label>
                  <Select value={displayStatus} onValueChange={(val) => setDisplayStatus(val || "")}>
                    <SelectTrigger className="h-11 w-full rounded-xl bg-background dark:bg-background-dark">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="DP Paid">DP Paid</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Tanggal Acara</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-muted-foreground dark:text-muted-foreground-dark" />
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="pl-10 h-11 rounded-xl bg-background dark:bg-background-dark"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Waktu Acara</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground dark:text-muted-foreground-dark" />
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="pl-10 h-11 rounded-xl bg-background dark:bg-background-dark"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-foreground/10 dark:border-foreground-dark/10">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
