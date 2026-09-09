export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 mt-8 animate-pulse">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm flex flex-col justify-center h-32">
          <div className="h-4 w-32 bg-muted/60 rounded-md mb-4"></div>
          <div className="h-8 w-16 bg-muted/60 rounded-md"></div>
        </div>
        <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm flex flex-col justify-center h-32">
          <div className="h-4 w-48 bg-muted/60 rounded-md mb-4"></div>
          <div className="h-8 w-32 bg-muted/60 rounded-md"></div>
        </div>
      </div>

      {/* Pie Chart & Latest Bookings Skeleton */}
      <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="flex flex-col lg:col-span-3">
            <div className="h-4 w-48 bg-muted/60 rounded-md mb-4"></div>
            <div className="h-[300px] w-full max-w-[300px] bg-muted/30 rounded-full mx-auto aspect-square"></div>
          </div>
          <div className="flex flex-col lg:col-span-2">
            <div className="h-4 w-40 bg-muted/60 rounded-md mb-4"></div>
            <div className="space-y-3 mt-4">
              <div className="h-8 bg-muted/50 rounded-lg w-full"></div>
              <div className="h-8 bg-muted/30 rounded-lg w-full"></div>
              <div className="h-8 bg-muted/30 rounded-lg w-full"></div>
              <div className="h-8 bg-muted/30 rounded-lg w-full"></div>
              <div className="h-8 bg-muted/30 rounded-lg w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Skeleton */}
      <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm">
        <div className="h-4 w-48 bg-muted/60 rounded-md mb-4"></div>
        <div className="h-[400px] bg-muted/30 rounded-xl w-full"></div>
      </div>
    </div>
  )
}
