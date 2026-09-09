export default function NotificationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header and Mark All Read Button Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
        </div>
        <div className="h-10 w-[180px] bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-full"></div>
      </div>

      {/* Notifications List Skeleton */}
      <div className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark rounded-2xl border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 shadow-sm overflow-hidden divide-y divide-border">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 flex gap-4">
            <div className="mt-1 shrink-0">
              <div className="w-10 h-10 rounded-full bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div className="h-5 w-48 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
                <div className="h-3 w-24 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md ml-4"></div>
              </div>
              <div className="h-4 w-3/4 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
              <div className="h-4 w-1/2 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
            </div>
            <div className="shrink-0 flex items-center">
              <div className="w-2.5 h-2.5 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
