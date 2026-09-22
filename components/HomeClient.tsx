"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, CalendarHeart, Brush, Camera, Crown, Heart, Sparkles, Scissors, Flower2, Gem, Wand2, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const portfolioImages = [
  { src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop", alt: "Natural Beauty Makeup" },
  { src: "https://images.unsplash.com/photo-1512496015851-a1dc8b41cdce?q=80&w=800&auto=format&fit=crop", alt: "Soft Glam Look" },
  { src: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=800&auto=format&fit=crop", alt: "Bold Eye Makeup" },
  { src: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop", alt: "Wedding Elegance" },
  { src: "https://images.unsplash.com/photo-1526413232644-8a407dd56156?q=80&w=800&auto=format&fit=crop", alt: "Flawless Skin Finish" },
  { src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop", alt: "Editorial Makeup" },
];

const productBrands = Array.from({ length: 13 }).map((_, i) => ({
  name: `Brand ${i + 1}`,
  logo: `/brand-images/brand-${i + 1}.webp`
}));

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Crown, Heart, Camera, Brush, Star, Scissors, Flower2, Gem, Wand2, CalendarHeart
};

export default function HomeClient({ portfolios = [], services = [] }: { portfolios?: any[], services?: any[] }) {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden container-custom">
        <div className="absolute inset-0 -z-10">
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
              Professional Makeup Artist
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-tight mb-6">
              Enhance Your <br className="hidden md:block" />
              <span className="italic text-primary-dark">Natural Beauty</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground-dark mb-10 max-w-xl mx-auto font-light leading-relaxed">
              Layanan makeup eksklusif untuk pertunangan, wisuda, dan momen spesial Anda. Tampil percaya diri dengan sentuhan elegan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/booking"
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
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
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

      {/* Services Section */}
      <section id="services" className="py-24 bg-muted-dark/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl mb-4">Layanan Kami</h2>
            <p className="text-muted-foreground-dark max-w-2xl mx-auto">Kami menyediakan berbagai layanan makeup untuk memenuhi kebutuhan di hari spesial Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.length > 0 ? (
              services.map((service) => {
                const IconComponent = ICON_MAP[service.iconName] || Sparkles;
                return (
                  <div key={service.id} className="bg-background-dark p-8 rounded-2xl shadow-sm border border-foreground-dark/5 hover:shadow-md transition-shadow">
                    <IconComponent className="w-8 h-8 text-primary-dark mb-6" />
                    <h3 className="font-serif text-2xl mb-3">{service.name}</h3>
                    <p className="text-muted-foreground-dark mb-6 line-clamp-3">{service.description || "Layanan makeup profesional untuk kebutuhan momen spesial Anda."}</p>
                    <div className="font-medium">Mulai dari Rp {service.price.toLocaleString('id-ID')}</div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground-dark">Layanan sedang diperbarui.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-muted-dark/30 border-t border-foreground-dark/5">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl mb-4">Produk Pilihan Kami</h2>
            <p className="text-muted-foreground-dark max-w-2xl mx-auto">
              Kami memastikan hasil makeup yang tahan lama, flawless, dan aman bagi kulit Anda dengan menggunakan produk kosmetik dari brand terpercaya dan berkualitas tinggi.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 pt-8 pb-4 max-w-5xl mx-auto">
            {productBrands.map((brand, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
                className="relative group cursor-pointer"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-foreground/10 dark:border-foreground-dark/10 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 flex items-center justify-center p-4 sm:p-5">
                  <Image
                    src={brand.logo}
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
              Beberapa hasil karya terbaik kami. Temukan inspirasi gaya makeup yang sesuai dengan karakter Anda.
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
                    src={portfolio.imageUrl}
                    alt={portfolio.altText}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-md mb-2 w-max">
                      {portfolio.category}
                    </span>
                    <h3 className="text-white font-medium text-lg truncate">{portfolio.title}</h3>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground-dark">Portofolio sedang dalam proses update.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/booking"
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
    </main>
  );
}
