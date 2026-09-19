import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-[80vh] px-4 py-16 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <SearchX className="w-24 h-24 text-primary dark:text-primary-dark opacity-80" />
              <div className="absolute -inset-4 rounded-full bg-primary/10 dark:bg-primary-dark/10 blur-xl -z-10" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground dark:text-foreground-dark">
              404
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-foreground dark:text-foreground-dark">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm md:text-base leading-relaxed">
              Maaf, halaman yang Anda cari tidak dapat ditemukan, telah dipindahkan, atau URL mungkin kurang tepat.
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark rounded-full font-medium hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
