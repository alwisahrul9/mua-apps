'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function MonthRangeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [startMonth, setStartMonth] = useState<string>(searchParams.get('start') || '')
  const [endMonth, setEndMonth] = useState<string>(searchParams.get('end') || '')

  useEffect(() => {
    setStartMonth(searchParams.get('start') || '')
    setEndMonth(searchParams.get('end') || '')
  }, [searchParams])

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (startMonth) {
      params.set('start', startMonth)
    } else {
      params.delete('start')
    }
    
    if (endMonth) {
      params.set('end', endMonth)
    } else {
      params.delete('end')
    }

    router.push(`?${params.toString()}`)
  }

  const handleReset = () => {
    setStartMonth('')
    setEndMonth('')
    router.push('?')
  }

  return (
    <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-background rounded-2xl border border-foreground/10 shadow-sm">
      <div className="flex-1 w-full flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Bulan & Tahun Mulai</label>
        <input 
          type="month"
          value={startMonth} 
          onChange={(e) => setStartMonth(e.target.value)}
          className="h-10 px-3 py-2 bg-transparent border rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>
      <div className="flex-1 w-full flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Bulan & Tahun Akhir</label>
        <input 
          type="month"
          value={endMonth} 
          onChange={(e) => setEndMonth(e.target.value)}
          className="h-10 px-3 py-2 bg-transparent border rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button 
          onClick={handleReset} 
          className="flex-1 sm:flex-none h-10 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Reset
        </button>
        <button 
          onClick={handleFilter} 
          className="flex-1 sm:flex-none h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Terapkan
        </button>
      </div>
    </div>
  )
}
