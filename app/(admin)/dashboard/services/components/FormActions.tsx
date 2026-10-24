"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FormActions({
  submitText,
  cancelHref,
}: {
  submitText: string;
  cancelHref: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-foreground/10 dark:border-foreground-dark/10">
      <Button
        render={<Link href={cancelHref} />}
        nativeButton={false}
        variant="outline"
        className={`rounded-xl h-11 px-8 bg-transparant hover:bg-transparant dark:hover:bg-transparant shadow-sm ${pending ? "pointer-events-none opacity-50" : ""}`}
        aria-disabled={pending}
      >
        Batal
      </Button>
      <Button
        type="submit"
        disabled={pending}
        className="rounded-xl h-11 px-8 shadow-sm"
      >
        {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {submitText}
      </Button>
    </div>
  );
}
