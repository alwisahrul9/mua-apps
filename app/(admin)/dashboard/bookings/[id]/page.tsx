'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function BookingFallbackPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // Redirect after 10 seconds
    if (countdown === 0) {
      router.replace('/dashboard/bookings')
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Akses Tidak Diizinkan</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Anda tidak dapat mengakses halaman detail booking secara langsung. 
        Harap akses detail melalui halaman daftar booking.
      </p>

      <div className="bg-muted/50 p-6 rounded-2xl border border-foreground/10 max-w-sm w-full">
        <p className="text-sm font-medium mb-4">
          Otomatis kembali dalam <span className="text-primary text-lg font-bold mx-1">{countdown}</span> detik
        </p>

        <button 
          onClick={() => router.replace('/dashboard/bookings')}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Booking
        </button>
      </div>
    </div>
  )
}
