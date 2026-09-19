export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted dark:bg-muted-dark rounded-md"></div>
          <div className="h-4 w-64 max-w-full bg-muted/60 dark:bg-muted-dark/60 rounded-md"></div>
        </div>
        <div className="h-10 w-40 bg-muted dark:bg-muted-dark rounded-xl"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 bg-background dark:bg-background-dark overflow-hidden shadow-sm"
          >
            <div className="aspect-[3/4] w-full bg-muted/60 dark:bg-muted-dark/60"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
