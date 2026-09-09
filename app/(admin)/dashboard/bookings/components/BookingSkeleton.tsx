'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BookingSkeleton() {
  const router = useRouter()
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => router.back()}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col z-10"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-6 border-b border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded-md animate-pulse" />
            </div>
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-foreground/5 dark:bg-foreground-dark/5 dark:bg-foreground dark:bg-foreground-dark/5">
              <X className="w-6 h-6 text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark" />
            </button>
          </div>

          {/* Body Skeleton */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <div className="h-4 w-32 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded animate-pulse mb-3" />
                  <div className="space-y-4 bg-muted/10 dark:bg-muted-dark/10 dark:bg-muted dark:bg-muted-dark/10 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-1/3 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded animate-pulse" />
                          <div className="h-4 w-2/3 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-4 w-32 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded animate-pulse mb-3" />
                  <div className="space-y-4 bg-muted/10 dark:bg-muted-dark/10 dark:bg-muted dark:bg-muted-dark/10 p-4 rounded-2xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-1/3 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded animate-pulse" />
                          <div className="h-4 w-2/3 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <div className="h-4 w-32 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded animate-pulse mb-3" />
                  <div className="h-28 w-full bg-muted/10 dark:bg-muted-dark/10 dark:bg-muted dark:bg-muted-dark/10 rounded-2xl animate-pulse" />
                </div>
                
                <div>
                  <div className="h-4 w-32 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark rounded animate-pulse mb-3" />
                  <div className="h-48 w-full bg-muted/10 dark:bg-muted-dark/10 dark:bg-muted dark:bg-muted-dark/10 rounded-2xl animate-pulse" />
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
