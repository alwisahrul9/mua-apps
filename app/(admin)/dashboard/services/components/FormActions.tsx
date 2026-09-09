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
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-foreground/10">
      <Link
        href={cancelHref}
        className={`inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-muted hover:text-foreground h-11 px-8 shadow-sm ${pending ? 'pointer-events-none opacity-50' : ''}`}
        aria-disabled={pending}
      >
        Batal
      </Link>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {submitText}
      </button>
    </div>
  )
}
