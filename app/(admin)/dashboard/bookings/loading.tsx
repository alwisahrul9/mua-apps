import { Loader2 } from "lucide-react"

export default function BookingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted/60 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-muted/60 rounded-md"></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search and Filter Section Skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="w-full h-[46px] rounded-xl bg-muted/60"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-[140px] h-[46px] rounded-xl bg-muted/60"></div>
            <div className="w-[100px] h-[46px] rounded-xl bg-muted/60"></div>
          </div>
        </div>

        {/* Grid List Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-background border border-foreground/10 p-5 rounded-2xl shadow-sm h-[150px] flex flex-col justify-between">
              <div>
                <div className="h-6 w-3/4 bg-muted/60 rounded-md mb-2"></div>
                <div className="h-4 w-1/2 bg-muted/60 rounded-md"></div>
              </div>
              <div className="pt-4 border-t border-foreground/5 mt-auto">
                <div className="h-3 w-1/2 bg-muted/60 rounded-md mb-3"></div>
                <div className="h-6 w-24 bg-muted/60 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
