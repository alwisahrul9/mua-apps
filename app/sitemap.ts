import type { MetadataRoute } from "next"
import { getSeoSitemap, listPublicMuas } from "@/lib/api/public"
import { siteConfig } from "@/lib/site-config"
import { publicMediaUrl } from "@/lib/media-url"
import { blogArticles } from "@/lib/blog"
import {
  getPublicMuaDirectory,
  serviceCategories,
  serviceMatchesCategory,
  toSeoSlug,
} from "@/lib/seo-directory"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profiles, directory, backendProfiles, backendArticles] = await Promise.all([
    listPublicMuas().catch(() => []),
    getPublicMuaDirectory().catch(() => []),
    getSeoSitemap("profiles").catch(() => []),
    getSeoSitemap("articles").catch(() => []),
  ])
  const fallbackTenants: MetadataRoute.Sitemap = profiles.flatMap((profile) => {
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
  const absoluteUrl = (url: string) =>
    url.startsWith("http") ? url : `${siteConfig.url}/${url.replace(/^\//, "")}`
  const tenants: MetadataRoute.Sitemap = backendProfiles.length > 0
    ? backendProfiles.map((entry) => ({
        url: absoluteUrl(entry.url),
        lastModified: entry.lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: entry.images?.map(publicMediaUrl),
      }))
    : fallbackTenants

  const cities = new Map<string, string>()
  for (const { profile } of directory) {
    for (const area of profile.serviceArea ?? []) {
      const slug = toSeoSlug(area)
      if (slug && !cities.has(slug)) cities.set(slug, area)
    }
  }
  const cityUrls: MetadataRoute.Sitemap = [...cities.keys()].map((slug) => ({
    url: `${siteConfig.url}/area/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))
  const serviceUrls: MetadataRoute.Sitemap = serviceCategories.flatMap(
    (category) =>
      directory.some((entry) =>
        entry.services.some((service) =>
          serviceMatchesCategory(service, category),
        ),
      )
        ? [
            {
              url: `${siteConfig.url}/service/${category.slug}`,
              changeFrequency: "weekly" as const,
              priority: 0.8,
            },
          ]
        : [],
  )
  const fallbackBlogUrls: MetadataRoute.Sitemap = blogArticles.map((article) => ({
    url: `${siteConfig.url}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))
  const blogUrls: MetadataRoute.Sitemap = backendArticles.length > 0
    ? backendArticles.map((entry) => ({
        url: absoluteUrl(entry.url),
        lastModified: entry.lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        images: entry.images?.map(publicMediaUrl),
      }))
    : fallbackBlogUrls

  return [
    {
      url: siteConfig.url,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${siteConfig.url}/icon.png`],
    },
    {
      url: `${siteConfig.url}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...(cityUrls.length > 0
      ? [{ url: `${siteConfig.url}/area`, changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    ...(serviceUrls.length > 0
      ? [{ url: `${siteConfig.url}/service`, changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    ...tenants,
    ...cityUrls,
    ...serviceUrls,
    ...blogUrls,
  ]
}
