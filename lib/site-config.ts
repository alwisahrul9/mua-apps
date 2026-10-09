const defaultSiteUrl = "https://jadicantik.vercel.app";

function cleanUrl(value: string | undefined) {
  return value?.trim().replace(/\/$/, "") || "";
}

function splitList(value: string | undefined) {
  return (
    value
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}

export const siteConfig = {
  name: "JadiCantik",
  legalName:
    process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME?.trim() || "JadiCantik",
  url: cleanUrl(process.env.NEXT_PUBLIC_SITE_URL) || defaultSiteUrl,
  city: process.env.NEXT_PUBLIC_BUSINESS_CITY?.trim() || "",
  region: process.env.NEXT_PUBLIC_BUSINESS_REGION?.trim() || "",
  streetAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS?.trim() || "",
  postalCode: process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE?.trim() || "",
  serviceAreas: splitList(process.env.NEXT_PUBLIC_BUSINESS_SERVICE_AREAS),
  ownerName: process.env.NEXT_PUBLIC_MUA_NAME?.trim() || "",
  experience: process.env.NEXT_PUBLIC_MUA_EXPERIENCE?.trim() || "",
  phone: process.env.NEXT_PUBLIC_PHONE_NUMBER?.trim() || "",
  instagramUrl: cleanUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  tiktokUrl: cleanUrl(process.env.NEXT_PUBLIC_TIKTOK_URL),
  googleBusinessUrl: cleanUrl(process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL),
} as const;

export const socialLinks = [
  { label: "Instagram", href: siteConfig.instagramUrl },
  { label: "TikTok", href: siteConfig.tiktokUrl },
  { label: "Google Business Profile", href: siteConfig.googleBusinessUrl },
].filter((link) => Boolean(link.href));

export const serviceAreaLabel =
  siteConfig.serviceAreas.length > 0
    ? siteConfig.serviceAreas.join(", ")
    : siteConfig.city || "sesuai kesepakatan";

export function whatsappUrl(message: string) {
  const phone = siteConfig.phone.replace(/\D/g, "");

  if (!phone) return "/booking";

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
