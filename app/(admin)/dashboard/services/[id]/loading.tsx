import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ServiceDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60"></div>
        <div>
          <div className="h-8 w-48 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
        </div>
      </div>

      <div className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="h-9 w-3/4 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md mb-3"></div>
          <div className="h-8 w-1/3 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md mb-8"></div>
          
          <div className="space-y-4">
            <div>
              <div className="h-4 w-24 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md mb-3"></div>
              <div className="bg-muted/10 dark:bg-muted-dark/10 dark:bg-muted dark:bg-muted-dark/10 p-5 rounded-xl border border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5 space-y-3">
                <div className="h-4 w-full bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
                <div className="h-4 w-full bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
                <div className="h-4 w-3/4 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 dark:bg-muted-dark/30 dark:bg-muted dark:bg-muted-dark/30 p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-foreground/5 dark:border-foreground-dark/5 dark:border-foreground dark:border-foreground-dark/5">
          <div className="w-full sm:w-28 h-11 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-xl"></div>
          <div className="w-full sm:w-36 h-11 bg-muted/60 dark:bg-muted-dark/60 dark:bg-muted dark:bg-muted-dark/60 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
