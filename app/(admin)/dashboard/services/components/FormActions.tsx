"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function FormActions({ 
  submitText, 
  cancelHref 
}: { 
  submitText: string
  cancelHref: string 
}) {
  const { pending } = useFormStatus()
  
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10">
      <Link
        href={cancelHref}
        className={`inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark hover:bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark hover:text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark h-11 px-8 shadow-sm ${pending ? 'pointer-events-none opacity-50' : ''}`}
        aria-disabled={pending}
      >
        Batal
      </Link>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary dark:bg-primary-dark dark:bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark dark:text-primary-foreground dark:text-primary-foreground-dark hover:bg-primary/90 dark:bg-primary-dark/90 dark:bg-primary dark:bg-primary-dark/90 h-11 px-8 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {submitText}
      </button>
    </div>
  )
}
