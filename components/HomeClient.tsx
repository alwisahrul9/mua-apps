"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  CalendarHeart,
  Brush,
  Camera,
  Crown,
  Heart,
  Sparkles,
  Scissors,
  Flower2,
  Gem,
  Wand2,
  ChevronDown,
  MapPin,
  MessageCircle,
  Quote,
  UserRound,
  AtSign,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { RetryingNextImage } from "@/components/RetryingImage";
import { serviceAreaLabel, siteConfig, whatsappUrl } from "@/lib/site-config";
import { testimonials } from "@/lib/testimonials";
import { getMuaFaqs } from "@/lib/faqs";
import { publicMediaUrl } from "@/lib/media-url";
import type { MuaProfile } from "@/lib/api/types";

type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  altText: string;
};

type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  iconName: string;
};

const defaultProductBrands = Array.from({ length: 13 }).map((_, i) => ({
  name: `Brand ${i + 1}`,
  logo: `/brand-images/brand-${i + 1}.webp`,
}));

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Crown,
  Heart,
  Camera,
  Brush,
  Star,
  Scissors,
  Flower2,
  Gem,
  Wand2,
  CalendarHeart,
};

export default function HomeClient({
  portfolios = [],
  services = [],
  profile,
}: {
  portfolios?: PortfolioItem[];
  services?: ServiceItem[];
  profile?: MuaProfile | null;
}) {
  const brandName = profile?.brandName?.trim() || siteConfig.name;
  const city = profile
    ? profile.serviceArea?.[0] ?? ""
    : siteConfig.city;
  const serviceAreas =
    profile?.serviceArea?.join(", ") ||
    (profile ? "Sesuai kesepakatan" : serviceAreaLabel);
  const address =
    (profile ? profile.address?.trim() : siteConfig.streetAddress) ||
    "Alamat detail tersedia saat konsultasi.";
  const tagline =
    profile?.tagline?.trim() ||
    `Professional Makeup Artist${city ? ` di ${city}` : ""}`;
  const heroTitle =
    profile?.heroTitle?.trim() ||
    `${brandName}, Jasa MUA Profesional${city ? ` di ${city}` : ""}`;
  const heroDescription =
    profile?.heroDescription?.trim() ||
    "Layanan makeup eksklusif untuk pertunangan, wisuda, dan momen spesial Anda. Tampil percaya diri dengan sentuhan elegan.";
  const profileImage = profile?.profileImageUrl?.trim() || "";
  const coverImage = profile?.coverImageUrl?.trim() || "";
  const supportedBrands = (profile?.supportedBrands ?? [])
    .map((url, index) => ({ name: `Brand pendukung ${index + 1}`, logo: url.trim() }))
    .filter((brand) => brand.logo);
  const productBrands =
    supportedBrands.length > 0 ? supportedBrands : defaultProductBrands;
  const muaFaqs = getMuaFaqs(profile);
  const bookingHref = profile?.username ? `/${profile.username}/booking` : "/";
  const hasWhatsapp = Boolean(
    profile?.whatsappNumber || (!profile && siteConfig.phone),
  );
  const contactHref = profile
    ? profile.whatsappNumber
      ? `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`
      : bookingHref
    : whatsappUrl("Halo, saya ingin berkonsultasi tentang layanan makeup.");
  const instagramHref = profile?.instagramUsername
    ? `https://instagram.com/${profile.instagramUsername.replace(/^@/, "")}`
    : "";

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative isolate h-dvh min-h-[600px] flex items-center justify-center overflow-hidden container-custom">
        <div className="absolute inset-0 -z-10">
          {coverImage && (
            <>
              <RetryingNextImage
                src={coverImage}
                alt={`Cover ${brandName}`}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-background-dark/80" />
            </>
          )}
          {/* Subtle gradient blob for background */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-dark/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-dark/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="text-center max-w-3xl mx-auto z-10 px-4 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm tracking-widest uppercase text-muted-foreground-dark mb-4 block font-semibold">
              {tagline}
            </span>
            <h1 className="text-balance break-words font-serif text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground-dark mb-10 max-w-xl mx-auto font-light leading-relaxed">
              {heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={bookingHref}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-foreground-dark text-background-dark font-medium rounded-full overflow-hidden transition-all hover:bg-foreground-dark/90 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Pesan Jadwal Sekarang
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                href="#portfolio"
                onClick={() => {
                  window.location.hash = "#portfolio";
                  window.dispatchEvent(new Event("hashchange"));
                }}
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-foreground-dark border border-foreground-dark/20 font-medium rounded-full transition-all hover:border-foreground-dark/40 w-full sm:w-auto"
              >
                Lihat Portofolio
              </Link>
            </div>

            {/* Scroll Indicator (Mobile Only) */}
            <motion.div
              className="mt-16 sm:mt-24 md:hidden flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <Link
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" });
                  window.history.pushState(null, "", "#services");
                  window.dispatchEvent(new Event("hashchange"));
                }}
                className="p-3 rounded-full border border-foreground-dark/30 text-foreground-dark/80 flex items-center justify-center animate-bounce hover:bg-foreground-dark/10 hover:text-foreground-dark transition-colors"
                aria-label="Lihat layanan"
              >
                <ChevronDown className="w-6 h-6" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section
        id="about"
        className="border-y border-foreground-dark/5 bg-background-dark py-24"
      >
        <div className="container-custom grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-3xl border border-foreground-dark/10 bg-muted-dark/30">
            <div className="relative aspect-[4/3] bg-muted-dark/60">
              {profileImage ? (
                <RetryingNextImage
                  src={profileImage}
                  alt={`Foto profil ${brandName}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  fallback={
                    <div className="flex h-full items-center justify-center">
                      <UserRound className="h-20 w-20 text-primary-dark/70" />
                    </div>
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <UserRound className="h-20 w-20 text-primary-dark/70" />
                </div>
              )}
            </div>
            <div className="p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">
                Tentang MUA
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">
                {brandName}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground-dark">
                {tagline}
              </p>
            </div>
          </div>
          <div>
            <p className="text-lg leading-8 text-muted-foreground-dark">
              {brandName} menghadirkan layanan makeup yang disesuaikan untuk
              setiap klien. {" "}
              Kami membantu setiap klien menemukan tampilan yang nyaman, elegan,
              dan sesuai dengan karakter wajah, busana, serta kebutuhan
              acaranya.
            </p>
            <p className="mt-5 leading-7 text-muted-foreground-dark">
              Sebelum hari acara, kami membuka ruang konsultasi untuk membahas
              referensi, kondisi kulit, lokasi, dan jadwal. Pendekatan ini
              membantu proses makeup berjalan lebih tenang dan hasilnya sesuai
              harapan.
            </p>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-foreground-dark/10 p-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-dark" />
              <div>
                <p className="font-medium">Wilayah Pelayanan</p>
                <p className="mt-1 text-sm text-muted-foreground-dark">
                  {serviceAreas}
                </p>
                <p className="mt-1 text-sm text-muted-foreground-dark">
                  {address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-muted-dark/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl mb-4">
              Layanan Kami
            </h2>
            <p className="text-muted-foreground-dark max-w-2xl mx-auto">
              Kami menyediakan berbagai layanan makeup untuk memenuhi kebutuhan
              di hari spesial Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.length > 0 ? (
              services.map((service) => {
                const IconComponent = ICON_MAP[service.iconName] || Sparkles;
                return (
                  <div
                    key={service.id}
                    className="bg-background-dark p-8 rounded-2xl shadow-sm border border-foreground-dark/5 hover:shadow-md transition-shadow"
                  >
                    <IconComponent className="w-8 h-8 text-primary-dark mb-6" />
                    <h3 className="font-serif text-2xl mb-3">{service.name}</h3>
                    <p className="text-muted-foreground-dark mb-6 line-clamp-3">
                      {service.description ||
                        "Layanan makeup profesional untuk kebutuhan momen spesial Anda."}
                    </p>
                    <div className="font-medium">
                      Mulai dari Rp {service.price.toLocaleString("id-ID")}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground-dark">
                  Layanan sedang diperbarui.
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-muted-dark/30 border-t border-foreground-dark/5">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl mb-4">
              Produk Pilihan Kami
            </h2>
            <p className="text-muted-foreground-dark max-w-2xl mx-auto">
              Kami memastikan hasil makeup yang tahan lama, flawless, dan aman
              bagi kulit Anda dengan menggunakan produk kosmetik dari brand
              terpercaya dan berkualitas tinggi.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 pt-8 pb-4 max-w-5xl mx-auto">
            {productBrands.map((brand, i) => (
              <motion.div
                key={`${brand.logo}-${i}`}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                className="relative group cursor-pointer"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-foreground/10 dark:border-foreground-dark/10 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 flex items-center justify-center p-4 sm:p-5">
                  <Image
                    src={publicMediaUrl(brand.logo)}
                    alt={brand.name}
                    width={100}
                    height={100}
                    className="object-contain w-full h-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 bg-background-dark">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl mb-4">Portofolio</h2>
            <p className="text-muted-foreground-dark max-w-2xl mx-auto">
              Beberapa hasil karya terbaik kami. Temukan inspirasi gaya makeup
              yang sesuai dengan karakter Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {portfolios.length > 0 ? (
              portfolios.map((portfolio, i) => (
                <motion.div
                  key={portfolio.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted-dark"
                >
                  <Image
                    src={publicMediaUrl(portfolio.imageUrl)}
                    alt={portfolio.altText}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-md mb-2 w-max">
                      {portfolio.category}
                    </span>
                    <h3 className="text-white font-medium text-lg truncate">
                      {portfolio.title}
                    </h3>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground-dark">
                  Portofolio sedang dalam proses update.
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              href={bookingHref}
              className="inline-flex items-center justify-center px-8 py-4 bg-foreground-dark text-background-dark font-medium rounded-full overflow-hidden transition-all hover:bg-foreground-dark/90"
            >
              <span className="relative z-10 flex items-center gap-2">
                Tertarik? Pesan Sekarang
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section id="testimonials" className="bg-muted-dark/30 py-24">
          <div className="container-custom">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">
                Cerita Klien
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">
                Testimoni
              </h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure
                  key={`${testimonial.name}-${testimonial.service}`}
                  className="rounded-3xl border border-foreground-dark/10 bg-background-dark p-7"
                >
                  <Quote className="h-7 w-7 text-primary-dark" />
                  <blockquote className="mt-5 leading-7 text-muted-foreground-dark">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-6">
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground-dark">
                      {testimonial.service}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="faq" className="bg-background-dark py-24">
        <div className="container-custom grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">
              Informasi Booking
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground-dark">
              Masih memiliki pertanyaan lain? Hubungi kami agar kebutuhan acara
              Anda dapat dibahas lebih rinci.
            </p>
          </div>
          <div className="space-y-4">
            {muaFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-foreground-dark/10 bg-muted-dark/20 p-6"
              >
                <summary className="cursor-pointer list-none font-medium">
                  {faq.question}
                </summary>
                <p className="mt-4 text-sm leading-6 text-muted-foreground-dark">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-foreground-dark/5 bg-muted-dark/30 py-20">
        <div className="container-custom text-center">
          <h2 className="font-serif text-3xl md:text-5xl">
            Siap Menyiapkan Tampilan untuk Momen Anda?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground-dark">
            Konsultasikan layanan, jadwal, dan lokasi acara bersama{" "}
            {brandName}.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={bookingHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground-dark px-7 py-3.5 font-medium text-background-dark hover:bg-foreground-dark/90"
            >
              Pesan Jadwal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={contactHref}
              target={hasWhatsapp ? "_blank" : undefined}
              rel={hasWhatsapp ? "noreferrer" : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground-dark/20 px-7 py-3.5 font-medium hover:border-foreground-dark/40"
            >
              <MessageCircle className="h-4 w-4" />
              {hasWhatsapp ? "Konsultasi WhatsApp" : "Konsultasi saat Booking"}
            </a>
            {instagramHref && (
              <a
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground-dark/20 px-7 py-3.5 font-medium hover:border-foreground-dark/40"
              >
                <AtSign className="h-4 w-4" />
                Lihat Instagram
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
