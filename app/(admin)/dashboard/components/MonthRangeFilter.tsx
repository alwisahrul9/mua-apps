'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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
    <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-background dark:bg-background-dark rounded-2xl border border-foreground/10 dark:border-foreground-dark/10 shadow-sm">
      <div className="flex-1 w-full flex flex-col gap-2">
        <Label htmlFor="start-month" className="text-muted-foreground dark:text-muted-foreground-dark">Bulan & Tahun Mulai</Label>
        <Input
          id="start-month"
          type="month"
          value={startMonth}
          onChange={(e) => setStartMonth(e.target.value)}
          className="w-full bg-transparant"
        />
      </div>
      <div className="flex-1 w-full flex flex-col gap-2">
        <Label htmlFor="end-month" className="text-muted-foreground dark:text-muted-foreground-dark">Bulan & Tahun Akhir</Label>
        <Input
          id="end-month"
          type="month"
          value={endMonth}
          onChange={(e) => setEndMonth(e.target.value)}
          className="w-full bg-transparant"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 bg-transparant sm:flex-none border-foreground/20 dark:border-foreground-dark/20 hover:bg-muted dark:hover:bg-muted-dark"
        >
          Reset
        </Button>
        <Button
          onClick={handleFilter}
          className="flex-1 sm:flex-none bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90"
        >
          Terapkan
        </Button>
      </div>
    </div>
  )
}

