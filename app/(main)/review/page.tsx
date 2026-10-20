import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { checkReviewToken } from "@/lib/api/public";
import ReviewForm from "./ReviewForm";

export const metadata: Metadata = {
  title: "Berikan Ulasan",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token?.trim() ?? "";
  const review = token ? await checkReviewToken(token).catch(() => null) : null;
  const unavailable =
    !review || review.valid === false || review.alreadyReviewed;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background-dark px-4 py-16 text-foreground-dark">
      <section className="w-full max-w-xl rounded-3xl border border-foreground-dark/10 bg-muted-dark/20 p-6 shadow-xl sm:p-10">
        {unavailable ? (
          <div className="text-center">
            <CircleAlert className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="mt-4 font-serif text-3xl">
              Tautan Ulasan Tidak Tersedia
            </h1>
            <p className="mt-3 text-muted-foreground-dark">
              Tautan tidak valid, sudah digunakan, atau telah kedaluwarsa.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full border border-foreground-dark/15 px-6 py-3"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">
              Ulasan Klien
            </p>
            <h1 className="mt-3 font-serif text-3xl">
              Bagikan Pengalaman Anda
              {review.brandName ? ` dengan ${review.brandName}` : ""}
            </h1>
            <p className="mt-3 text-muted-foreground-dark">
              Ulasan jujur Anda membantu calon klien memilih layanan yang
              sesuai.
            </p>
            {review.serviceName && (
              <p className="mt-4 rounded-2xl bg-primary-dark/10 p-4 text-sm">
                Layanan: <strong>{review.serviceName}</strong>
              </p>
            )}
            <ReviewForm token={token} username={review.username} />
          </>
        )}
      </section>
    </main>
  );
}
