export const publicArticlesCacheTag = "public-articles"
export const publicArticleCacheTag = (slug: string) => `public-article:${slug.trim().toLowerCase()}`
export const publicReviewsCacheTag = (username: string) => `public-reviews:${username.trim().toLowerCase()}`
export const seoSitemapCacheTag = (type: "profiles" | "articles") => `seo-sitemap:${type}`
