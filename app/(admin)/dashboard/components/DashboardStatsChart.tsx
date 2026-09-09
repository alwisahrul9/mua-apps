'use client'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

interface DashboardStatsChartProps {
  data: {
    name: string
    value: number
  }[]
}

const COLORS: Record<string, string> = {
  PENDING: '#f5b041',    // Soft Orange/Amber
  DP_PAID: '#5dade2',    // Soft Sky Blue
  COMPLETED: '#58d68d',  // Soft Mint Green
  CANCELED: '#ec7063',   // Soft Coral Red
}

export default function DashboardStatsChart({ data }: DashboardStatsChartProps) {
  // Hitung total untuk persentase
  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Belum ada data pesanan tahun ini.
      </div>
    )
  }

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: data.map(d => COLORS[d.name] || '#94a3b8'),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 13
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ''
            const value = context.parsed || 0
            return ` ${label}: ${value} Booking`
          }
        },
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        cornerRadius: 8,
      },
      datalabels: {
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 16
        },
        formatter: (value: number) => {
          if (total === 0) return ''
          const percentage = ((value / total) * 100).toFixed(0)
          return percentage === '0' ? '' : `${percentage}%`
        }
      }
    }
  }

  return (
    <div className="w-full h-full flex justify-center items-center relative min-h-[300px]">
      <Pie data={chartData} options={options} />
    </div>
  )
}
