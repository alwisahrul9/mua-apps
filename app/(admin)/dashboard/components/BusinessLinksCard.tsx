"use client";

import Link from "next/link";
import {
  CalendarCheck2,
  Copy,
  ExternalLink,
  Globe2,
  Share2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type BusinessLinksCardProps = {
  baseUrl: string;
  username: string;
  homepageIsActive: boolean;
  hasServices: boolean;
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Tautan tidak dapat disalin.");
}

export default function BusinessLinksCard({
  baseUrl,
  username,
  homepageIsActive,
  hasServices,
}: BusinessLinksCardProps) {
  const encodedUsername = encodeURIComponent(username);
  const homepageUrl = `${baseUrl}/${encodedUsername}`;
  const bookingUrl = `${homepageUrl}/booking`;

  async function copyLink(label: string, url: string) {
    try {
      await copyText(url);
      toast.add({
        title: "Tautan disalin",
        description: `Link ${label.toLowerCase()} siap dibagikan.`,
        type: "success",
        timeout: 4000,
      });
    } catch {
      toast.add({
        title: "Tautan gagal disalin",
        description: "Salin alamat secara manual dari kolom tautan.",
        type: "error",
        timeout: 5000,
      });
    }
  }

  async function shareLink(label: string, url: string) {
    if (!navigator.share) {
      await copyLink(label, url);
      return;
    }

    try {
      await navigator.share({
        title: label,
        text:
          label === "Homepage MUA"
            ? "Lihat layanan dan portofolio MUA saya."
            : "Isi formulir berikut untuk melakukan booking.",
        url,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copyLink(label, url);
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-primary/15 bg-primary/[0.035] dark:border-primary-dark/15 dark:bg-primary-dark/[0.04]">
      <CardHeader className="gap-1 border-b border-foreground/5 dark:border-foreground-dark/5">
        <CardTitle className="font-serif text-xl">Tautan Bisnis Anda</CardTitle>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
          Bagikan tautan berikut melalui bio Instagram, TikTok, atau WhatsApp.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
        <BusinessLink
          icon={<Globe2 className="h-5 w-5" />}
          title="Homepage MUA"
          description="Layanan, profil, dan portofolio bisnis Anda."
          url={homepageUrl}
          active={homepageIsActive}
          setupHref="/dashboard/profile"
          setupLabel="Aktifkan di Pengaturan Profil"
          onCopy={() => copyLink("Homepage MUA", homepageUrl)}
          onShare={() => shareLink("Homepage MUA", homepageUrl)}
        />
        <BusinessLink
          icon={<CalendarCheck2 className="h-5 w-5" />}
          title="Form Booking"
          description={
            hasServices
              ? "Bagikan link ini pada calon klien untuk melakukan booking online."
              : "Tambahkan minimal satu layanan agar form booking dapat diakses klien."
          }
          url={bookingUrl}
          active={hasServices}
          setupHref="/dashboard/services/create"
          setupLabel="Tambah Layanan"
          onCopy={() => copyLink("Form Booking", bookingUrl)}
          onShare={() => shareLink("Form Booking", bookingUrl)}
        />
      </CardContent>
    </Card>
  );
}

function BusinessLink({
  icon,
  title,
  description,
  url,
  active,
  setupHref,
  setupLabel,
  onCopy,
  onShare,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  url: string;
  active: boolean;
  setupHref: string;
  setupLabel: string;
  onCopy: () => void;
  onShare: () => void;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-foreground/10 bg-background p-4 dark:border-foreground-dark/10 dark:bg-background-dark sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{title}</h2>
            {!active && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Belum aktif
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground dark:text-muted-foreground-dark">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 min-w-0 rounded-xl border border-foreground/10 bg-muted/40 px-3 py-2 dark:border-foreground-dark/10 dark:bg-muted-dark/40">
        <p className="truncate text-sm" title={url}>
          {url}
        </p>
      </div>

      {active ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopy}
            aria-label={`Salin ${title}`}
          >
            <Copy />
            <span className="hidden sm:inline">Salin</span>
          </Button>
          <Link
            href={url}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                "w-full block border-foreground/10 dark:border-foreground-dark/10",
            })}
            aria-label={`Buka ${title}`}
          >
            <ExternalLink />
            <span className="hidden sm:inline">Buka</span>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShare}
            aria-label={`Bagikan ${title}`}
          >
            <Share2 />
            <span className="hidden sm:inline">Bagikan</span>
          </Button>
        </div>
      ) : (
        <Link
          href={setupHref}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "mt-4 w-full",
          })}
        >
          {setupLabel}
        </Link>
      )}
    </section>
  );
}
