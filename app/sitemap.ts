import type { MetadataRoute } from "next"
import { listPublicMuas } from "@/lib/api/public"
import { siteConfig } from "@/lib/site-config"
import { publicMediaUrl } from "@/lib/media-url"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await listPublicMuas().catch(() => [])
  const tenants: MetadataRoute.Sitemap = profiles.flatMap((profile) => {
    if (!profile.username || profile.homepageIsActive !== true) return []
    const username = encodeURIComponent(profile.username)
    return [
      {
        url: `${siteConfig.url}/${username}`,
        lastModified: profile.updatedAt ?? profile.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: [profile.coverImageUrl, profile.profileImageUrl]
          .filter((image): image is string => Boolean(image))
          .map(publicMediaUrl),
      },
    ]
  })

  return [
    {
      url: siteConfig.url,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${siteConfig.url}/icon.png`],
    },
    ...tenants,
  ]
}
