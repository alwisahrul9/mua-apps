"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Variant = "header" | "hero" | "banner" | "footer";

let sessionRequest: Promise<boolean> | null = null;

function hasAuthenticatedSession() {
  sessionRequest ??= fetch("/api/auth/session", {
    credentials: "same-origin",
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) return false;
      const session = (await response.json()) as { accessToken?: string };
      return Boolean(session.accessToken);
    })
    .catch(() => false);

  return sessionRequest;
}

function LoadingActions({ variant }: { variant: Variant }) {
  if (variant === "footer") {
    return (
      <span
        className="h-5 w-24 animate-pulse rounded bg-foreground-dark/10"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={
        variant === "hero"
          ? "flex w-full flex-col gap-3 sm:flex-row"
          : "flex items-center gap-2"
      }
      aria-hidden="true"
    >
      <span
        className={`${variant === "hero" ? "h-14 w-full sm:w-56" : "h-10 w-20"} animate-pulse rounded-full bg-foreground-dark/10`}
      />
      {variant !== "banner" && (
        <span
          className={`${variant === "hero" ? "h-14 w-full sm:w-48" : "h-10 w-28"} animate-pulse rounded-full bg-foreground-dark/10`}
        />
      )}
    </div>
  );
}

export default function HomeAuthActions({ variant }: { variant: Variant }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void hasAuthenticatedSession().then((result) => {
      if (active) setAuthenticated(result);
    });
    return () => {
      active = false;
    };
  }, []);

  if (authenticated === null) return <LoadingActions variant={variant} />;

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
