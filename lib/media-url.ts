const mediaBaseUrl = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/$/, "")

/** Use the production media domain for legacy R2 development URLs. */
export function publicMediaUrl(source: string) {
  if (!source || !mediaBaseUrl) return source

  try {
    const url = new URL(source)
    if (!url.hostname.endsWith(".r2.dev")) return source
    return `${mediaBaseUrl}${url.pathname}${url.search}${url.hash}`
  } catch {
    return source
  }
}
