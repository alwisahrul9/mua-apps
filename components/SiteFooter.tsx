import Link from "next/link"
import { MapPin, MessageCircle } from "lucide-react"
import { serviceAreaLabel, siteConfig, socialLinks, whatsappUrl } from "@/lib/site-config"
import type { MuaProfile } from "@/lib/api/types"

export function SiteFooter({
  profile,
  lightMode = false,
}: {
  profile: MuaProfile;
  lightMode?: boolean;
}) {
  const brandName = profile.brandName || siteConfig.name
  const areas = profile.serviceArea?.join(", ") || serviceAreaLabel
  const homeHref = `/${profile.username}`
  const tenantSocialLinks = profile.instagramUsername
    ? [{ label: "Instagram", href: `https://instagram.com/${profile.instagramUsername.replace(/^@/, "")}` }]
    : socialLinks
  const contactUrl = profile.whatsappNumber
    ? `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`
    : whatsappUrl(`Halo ${brandName}, saya ingin bertanya tentang layanan makeup.`)
  return (
    <footer
      id="contact"
      className={
        lightMode
          ? "border-t border-foreground/10 bg-muted/30 text-foreground"
          : "border-t border-foreground-dark/10 bg-muted-dark/30"
      }
    >
      <div className="container-custom grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl">{brandName}</p>
          <p className={`mt-3 max-w-md text-sm leading-6 ${lightMode ? "text-muted-foreground" : "text-muted-foreground-dark"}`}>
            Layanan makeup profesional untuk pertunangan, wisuda, photoshoot, dan momen spesial lainnya.
          </p>
          <div className={`mt-5 flex items-start gap-2 text-sm ${lightMode ? "text-muted-foreground" : "text-muted-foreground-dark"}`}>
            <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${lightMode ? "text-primary" : "text-primary-dark"}`} />
            <span>Area pelayanan: {areas}</span>
          </div>
        </div>

        <div>
          <p className="font-medium">Jelajahi</p>
          <div className={`mt-4 flex flex-col gap-3 text-sm ${lightMode ? "text-muted-foreground" : "text-muted-foreground-dark"}`}>
            {[
              ["about", "Tentang"],
              ["services", "Layanan"],
              ["portfolio", "Portofolio"],
              ["faq", "FAQ"],
            ].map(([section, label]) => (
              <Link
                key={section}
                href={`${homeHref}#${section}`}
                className={lightMode ? "hover:text-primary" : "hover:text-primary-dark"}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-medium">Kontak</p>
          <a
            href={contactUrl}
            target="_blank"
            rel="noreferrer"
            className={`mt-4 inline-flex items-center gap-2 text-sm ${lightMode ? "text-muted-foreground hover:text-primary" : "text-muted-foreground-dark hover:text-primary-dark"}`}
          >
            <MessageCircle className="h-4 w-4" />
            Hubungi melalui WhatsApp
          </a>
          {tenantSocialLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {tenantSocialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={lightMode ? "text-muted-foreground hover:text-primary" : "text-muted-foreground-dark hover:text-primary-dark"}>
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={`border-t py-5 text-center text-xs ${lightMode ? "border-foreground/10 text-muted-foreground" : "border-foreground-dark/10 text-muted-foreground-dark"}`}>
        © {new Date().getFullYear()} {brandName}. Semua hak dilindungi.
      </div>
    </footer>
  )
}
