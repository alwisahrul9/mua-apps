import type { ReactNode } from "react";
import { Globe2, LockKeyhole } from "lucide-react";
import { serverApi } from "@/lib/api/server";
import { extractMuaProfile } from "@/lib/profile";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function PortfoliosLayout({
  children,
}: {
  children: ReactNode;
}) {
  const response = await (await serverApi())
    .get("/user/profile")
    .catch(() => null);
  const profile = response ? extractMuaProfile(response.data) : null;

  if (profile?.homepageIsActive === false) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-2xl items-center justify-center py-8">
        <Card className="w-full rounded-3xl border-foreground/10 bg-background p-6 text-center shadow-sm dark:border-foreground-dark/10 dark:bg-background-dark sm:p-10">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 text-primary dark:bg-primary-dark/15 dark:text-primary-dark">
            <Globe2 className="h-9 w-9" />
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-muted text-muted-foreground dark:border-background-dark dark:bg-muted-dark dark:text-muted-foreground-dark">
              <LockKeyhole className="h-3.5 w-3.5" />
            </span>
          </div>

          <h1 className="font-serif text-2xl text-foreground dark:text-foreground-dark sm:text-3xl">
            Homepage Belum Aktif
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground dark:text-muted-foreground-dark sm:text-base">
            Halaman portofolio dapat diakses setelah homepage Anda aktif.
            Aktifkan homepage terlebih dahulu{" "}
            <Link
              href="/dashboard/profile"
              className="text-primary underline hover:underline dark:text-primary-dark"
            >
              Disini
            </Link>{" "}
            untuk menambah dan mengelola karya.
          </p>
        </Card>
      </div>
    );
  }

  return children;
}
