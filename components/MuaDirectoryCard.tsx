import Image from "next/image"
import Link from "next/link"
import { MapPin, Sparkles, UserRound } from "lucide-react"
import type { PublicMuaDirectoryEntry } from "@/lib/seo-directory"
import { getEntryLowestPrice } from "@/lib/seo-directory"
import { publicMediaUrl } from "@/lib/media-url"

export function MuaDirectoryCard({ entry }: { entry: PublicMuaDirectoryEntry }) {
  const { profile, services } = entry
  const lowestPrice = getEntryLowestPrice(entry)
  const href = `/${encodeURIComponent(profile.username!)}`
  const image = profile.profileImageUrl?.trim()

  return (
    <article className="group min-w-0">
      <Link href={href} className="flex flex-col items-center">
        <div className="relative z-10 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:h-32 sm:w-32">
          {image ? (
            <Image
              src={publicMediaUrl(image)}
              alt={`Foto profil ${profile.brandName}, makeup artist di ${profile.serviceArea?.[0] ?? "Indonesia"}`}
              fill
              className="rounded-full object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 7rem, 8rem"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <UserRound className="h-12 w-12 text-primary/70" />
            </div>
          )}
        </div>
        <div className="mt-4 w-full rounded-3xl border border-foreground/10 bg-background p-6 text-center shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg">
          <h2 className="font-serif text-2xl">{profile.brandName}</h2>
          <p className="mt-2 flex items-start justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {profile.serviceArea?.join(", ") || "Area layanan sesuai kesepakatan"}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {services.slice(0, 3).map((service) => (
              <span
                key={service.id}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
              >
                {service.name}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-foreground/10 pt-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {lowestPrice === null
                ? "Lihat service"
                : `Mulai Rp${lowestPrice.toLocaleString("id-ID")}`}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Lihat Profil
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
