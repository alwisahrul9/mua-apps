import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Variant = "header" | "hero" | "banner" | "footer";

export default function HomeAuthActions({
  variant,
  authenticated,
}: {
  variant: Variant;
  authenticated: boolean;
}) {
  if (authenticated) {
    if (variant === "footer") {
      return (
        <Link href="/dashboard" className="hover:text-foreground-dark">
          Dashboard
        </Link>
      );
    }

    return (
      <Link
        href="/dashboard"
        className={
          variant === "hero" || variant === "banner"
            ? "inline-flex items-center justify-center gap-2 rounded-full bg-foreground-dark px-7 py-4 font-medium text-background-dark transition hover:opacity-90"
            : "rounded-full bg-foreground-dark px-5 py-2.5 text-sm font-medium text-background-dark transition hover:opacity-90"
        }
      >
        Buka Dashboard
        {(variant === "hero" || variant === "banner") && (
          <ArrowRight className="h-4 w-4" />
        )}
      </Link>
    );
  }

  if (variant === "header") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full px-4 py-2.5 text-sm font-medium hover:bg-muted-dark"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-foreground-dark px-5 py-2.5 text-sm font-medium text-background-dark transition hover:opacity-90"
        >
          Daftar Gratis
        </Link>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground-dark px-7 py-4 font-medium text-background-dark transition hover:opacity-90"
        >
          Buat Halaman MUA Gratis
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-foreground-dark/20 px-7 py-4 font-medium transition hover:bg-muted-dark"
        >
          Sudah punya akun? Login
        </Link>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <>
        <Link href="/login" className="hover:text-foreground-dark">
          Login
        </Link>
        <Link href="/register" className="hover:text-foreground-dark">
          Daftar
        </Link>
      </>
    );
  }

  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-2 rounded-full bg-foreground-dark px-7 py-4 font-medium text-background-dark"
    >
      Bergabung Sekarang <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
