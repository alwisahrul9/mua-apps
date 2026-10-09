"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Globe, Home, List, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { RetryingHtmlImage } from "@/components/RetryingImage";

const desktopNavItems = [
  { name: "Overview", href: "/dashboard", icon: Home, exact: true },
  { name: "Bookings", href: "/dashboard/bookings", icon: List, exact: false },
  { name: "Layanan", href: "/dashboard/services", icon: Briefcase, exact: false },
  { name: "Portofolio", href: "/dashboard/portfolios", icon: Globe, exact: false },
];

const mobileNavItems = desktopNavItems;

export default function DashboardNavigation({
  name,
  profileImageUrl,
}: {
  name: string | undefined;
  profileImageUrl?: string | null;
}) {
  const pathname = usePathname();
  const [avatarOverride, setAvatarOverride] = useState<{
    base: string | null | undefined;
    value: string;
  } | null>(null);
  const avatarUrl =
    avatarOverride && avatarOverride.base === profileImageUrl
      ? avatarOverride.value
      : (profileImageUrl ?? "");

  useEffect(() => {
    const updateAvatar = (event: Event) => {
      setAvatarOverride({
        base: profileImageUrl,
        value: (event as CustomEvent<string>).detail ?? "",
      });
    };
    window.addEventListener("profile-image-updated", updateAvatar);
    return () => window.removeEventListener("profile-image-updated", updateAvatar);
  }, [profileImageUrl]);
  const isNavActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 flex-col border-r border-foreground/10 bg-background dark:border-foreground-dark/10 dark:bg-background-dark md:flex">
        <div className="p-6">
          <h2 className="font-serif text-2xl">MUA Admin</h2>
          <p className="mt-1 truncate text-sm text-muted-foreground dark:text-muted-foreground-dark">{name}</p>
        </div>
        <nav className="mt-4 flex-1 space-y-2 px-4">
          {desktopNavItems.map((item) => {
            const active = isNavActive(item.href, item.exact);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: active ? "default" : "ghost" }),
                  "w-full justify-start gap-3 rounded-xl px-3 py-5 text-sm font-medium shadow-none transition-all",
                  active
                    ? "dark:bg-primary-dark dark:text-primary-foreground-dark"
                    : "text-foreground/80 hover:bg-muted dark:text-foreground-dark/80 dark:hover:bg-muted-dark",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background pb-safe dark:border-foreground-dark/10 dark:bg-background-dark md:hidden">
        <nav className="flex items-center justify-around p-2">
          {mobileNavItems.map((item) => {
            const active = isNavActive(item.href, item.exact);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex w-16 flex-col items-center gap-1 p-2 transition-colors",
                  active
                    ? "text-primary dark:text-primary-dark"
                    : "text-muted-foreground dark:text-muted-foreground-dark",
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("toggle-mobile-profile-menu"))}
            className={cn(
              "flex w-16 flex-col items-center gap-1 p-2 transition-colors",
              pathname.startsWith("/dashboard/profile") || pathname.startsWith("/dashboard/settings")
                ? "text-primary dark:text-primary-dark"
                : "text-muted-foreground dark:text-muted-foreground-dark",
            )}
            aria-label="Buka menu profil"
          >
            {avatarUrl ? (
              <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
                <RetryingHtmlImage
                  src={avatarUrl}
                  alt="Foto profil"
                  className="h-full w-full object-cover"
                  fallback={<UserRound className="h-6 w-6" />}
                />
              </span>
            ) : (
              <UserRound className="h-6 w-6" />
            )}
            <span className="text-[10px] font-medium">Profil</span>
          </button>
        </nav>
      </div>
    </>
  );
}
