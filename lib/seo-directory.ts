import { cache } from "react"
import { getPublicServices, listPublicMuas } from "@/lib/api/public"
import type { MuaProfile, Service } from "@/lib/api/types"

export type PublicMuaDirectoryEntry = {
  profile: MuaProfile
  services: Service[]
}

export const serviceCategories = [
  {
    slug: "wisuda",
    name: "MUA Wisuda",
    keywords: ["wisuda", "graduation"],
    description: "makeup wisuda yang natural, tahan lama, dan sesuai karakter wajah",
  },
  {
    slug: "wedding",
    name: "MUA Wedding",
    keywords: ["wedding", "pernikahan", "pengantin", "bridal"],
    description: "rias pengantin dan wedding untuk akad, resepsi, serta rangkaian pernikahan",
  },
  {
    slug: "lamaran",
    name: "MUA Lamaran",
    keywords: ["lamaran", "engagement", "tunangan", "pertunangan"],
    description: "makeup lamaran dan pertunangan untuk tampilan elegan di hari spesial",
  },
  {
    slug: "pesta",
    name: "MUA Pesta",
    keywords: ["pesta", "party", "kondangan"],
    description: "makeup pesta dan kondangan yang disesuaikan dengan busana serta acara",
  },
  {
    slug: "photoshoot",
    name: "MUA Photoshoot",
    keywords: ["photoshoot", "photo shoot", "pemotretan", "foto"],
    description: "makeup photoshoot untuk kebutuhan personal, editorial, dan komersial",
  },
] as const

export function toSeoSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(kabupaten|kab\.?|kota)\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatSeoName(value: string) {
  return decodeURIComponent(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function getServiceCategory(slug: string) {
  const normalizedSlug = toSeoSlug(decodeURIComponent(slug))
  return serviceCategories.find((category) => category.slug === normalizedSlug)
}

export function serviceMatchesCategory(
  service: Service,
  category: (typeof serviceCategories)[number],
) {
  const haystack = `${service.name} ${service.description ?? ""}`.toLowerCase()
  return category.keywords.some((keyword) => haystack.includes(keyword))
}

export const getPublicMuaDirectory = cache(async (filters?: { city?: string; category?: string }) => {
  const profiles = (await listPublicMuas(filters)).filter(
    (profile) => profile.homepageIsActive === true && profile.username,
  )

  return Promise.all(
    profiles.map(async (profile): Promise<PublicMuaDirectoryEntry> => ({
      profile,
      services: await getPublicServices(profile.username!).catch(() => []),
    })),
  )
})

export function getEntryLowestPrice(entry: PublicMuaDirectoryEntry) {
  const prices = entry.services
    .map((service) => service.price)
    .filter((price) => Number.isFinite(price) && price >= 0)
  return prices.length > 0 ? Math.min(...prices) : null
}
