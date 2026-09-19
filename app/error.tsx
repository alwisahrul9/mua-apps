"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCcw, Home } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-[80vh] px-4 py-16 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <AlertOctagon className="w-24 h-24 text-red-500/80" />
              <div className="absolute -inset-4 rounded-full bg-red-500/10 blur-xl -z-10" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-serif text-foreground dark:text-foreground-dark">
              Terjadi Kesalahan
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm md:text-base leading-relaxed">
              Maaf, ada masalah di sistem kami saat memproses halaman ini. Silakan coba muat ulang atau kembali ke beranda.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark rounded-full font-medium hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
            >
              <RefreshCcw className="w-5 h-5" />
              Coba Lagi
            </button>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-muted dark:bg-muted-dark text-foreground dark:text-foreground-dark rounded-full font-medium hover:bg-muted/80 dark:hover:bg-muted-dark/80 transition-all border border-foreground/5 dark:border-foreground-dark/5 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Beranda
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
