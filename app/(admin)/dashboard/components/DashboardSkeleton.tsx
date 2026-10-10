import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Skeleton({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-muted dark:bg-muted-dark ${className}`}
    />
  );
}

export default function DashboardSkeleton() {
  return (
    <div
      className="space-y-8 animate-pulse"
      aria-busy="true"
      aria-label="Memuat dashboard"
    >
      <span className="sr-only" role="status">
        Memuat ringkasan dashboard...
      </span>

      <div className="space-y-2">
        <Skeleton className="h-9 w-full max-w-sm rounded-lg" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full space-y-2 sm:max-w-48">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="w-full space-y-2 sm:max-w-48">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl sm:w-28" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={index} className="rounded-2xl">
            <CardHeader>
              <Skeleton className={`h-4 ${index === 0 ? "w-28" : "w-40"}`} />
            </CardHeader>
            <CardContent>
              <Skeleton className={`h-9 ${index === 0 ? "w-16" : "w-44"}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 rounded-2xl border bg-background p-6 lg:grid-cols-5 dark:bg-background-dark">
        <div className="lg:col-span-3">
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="flex h-[300px] items-center justify-center">
            <div className="aspect-square h-56 max-h-full rounded-full border-[28px] border-muted dark:border-muted-dark" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <Skeleton className="mb-6 h-4 w-36" />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 border-b pb-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="grid grid-cols-3 items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border bg-background p-4 sm:p-6 dark:bg-background-dark">
        <Skeleton className="mb-6 h-4 w-36" />
        <div className="flex h-[400px] items-end gap-3 overflow-hidden border-b border-l px-4 sm:gap-5">
          {[45, 72, 55, 88, 65, 82, 58, 76].map((height, index) => (
            <div
              key={index}
              className="min-w-10 flex-1 rounded-t-md bg-muted dark:bg-muted-dark"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
