'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function BookingSkeleton() {
  const router = useRouter()
  
  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="rounded-3xl sm:rounded-3xl w-[95%] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none bg-background dark:bg-background-dark">
        {/* Header Skeleton */}
        <DialogHeader className="flex flex-row items-start sm:items-center justify-between p-6 pr-12 border-b border-foreground/10 dark:border-foreground-dark/10 space-y-0 text-left">
          <div className="space-y-2">
            <DialogTitle className="sr-only">Loading Booking</DialogTitle>
            <div className="h-8 w-48 bg-muted dark:bg-muted-dark rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-muted dark:bg-muted-dark rounded-md animate-pulse" />
          </div>
        </DialogHeader>

        {/* Body Skeleton */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <div className="h-4 w-32 bg-muted dark:bg-muted-dark rounded animate-pulse mb-3" />
                <div className="space-y-4 bg-muted/10 dark:bg-muted-dark/10 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-muted dark:bg-muted-dark animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-1/3 bg-muted dark:bg-muted-dark rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-muted dark:bg-muted-dark rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="h-4 w-32 bg-muted dark:bg-muted-dark rounded animate-pulse mb-3" />
                <div className="space-y-4 bg-muted/10 dark:bg-muted-dark/10 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-muted dark:bg-muted-dark animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-1/3 bg-muted dark:bg-muted-dark rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-muted dark:bg-muted-dark rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <div className="h-4 w-32 bg-muted dark:bg-muted-dark rounded animate-pulse mb-3" />
                <div className="h-28 w-full bg-muted/10 dark:bg-muted-dark/10 rounded-2xl animate-pulse" />
              </div>
              
              <div>
                <div className="h-4 w-32 bg-muted dark:bg-muted-dark rounded animate-pulse mb-3" />
                <div className="h-48 w-full bg-muted/10 dark:bg-muted-dark/10 rounded-2xl animate-pulse" />
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
