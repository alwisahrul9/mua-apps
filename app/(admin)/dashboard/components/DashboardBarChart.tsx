'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
]

interface DashboardBarChartProps {
  data: {
    year: number
    month: number
    bookingCount: number
    income: number
  }[]
}

export default function DashboardBarChart({ data }: DashboardBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">
        Belum ada data untuk rentang bulan tersebut.
      </div>
    )
  }

  // Ensure data is sorted by year and then month
  const sortedData = [...data].sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month
    }
    return a.year - b.year
  })

  const labels = sortedData.map(d => `${MONTH_LABELS[d.month - 1]} ${d.year}`)
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Jumlah Booking',
        data: sortedData.map(d => d.bookingCount),
        backgroundColor: '#5dade2',
        yAxisID: 'y',
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: 'Total Pendapatan (Rp)',
        data: sortedData.map(d => d.income),
        backgroundColor: '#58d68d',
        yAxisID: 'y1',
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      datalabels: {
        display: false // Disable datalabels for bar chart to keep it clean
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ''
            let value = context.parsed.y
            if (label.includes('Pendapatan')) {
              value = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
            }
            return ` ${label}: ${value}`
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Jumlah Booking'
        },
        ticks: {
          stepSize: 1,
          precision: 0
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Total Pendapatan (Rp)'
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
        ticks: {
          callback: (value: any) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + ' Jt'
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + ' K'
            }
            return value
          }
        }
      },
    },
  }

  return (
    <div className="w-full h-full relative min-h-[350px]">
      <Bar data={chartData} options={options} />
    </div>
  )
}
