import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  CalendarCheck,
  Check,
  Globe2,
  Images,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import HomeAuthActions from "@/components/HomeAuthActions";
import { siteConfig } from "@/lib/site-config";

const features = [
  {
    icon: Globe2,
    title: "Website MUA dengan username sendiri",
    description:
      "Dapatkan halaman publik yang mudah dibagikan untuk memperkenalkan brand dan wilayah layanan Anda.",
  },
  {
    icon: CalendarCheck,
    title: "Booking klien lebih teratur",
    description:
      "Klien memilih layanan dan jadwal dari halaman Anda, lalu data booking masuk ke dashboard.",
  },
  {
    icon: Images,
    title: "Portofolio dalam satu tempat",
    description:
      "Tampilkan hasil makeup terbaik agar calon klien lebih yakin sebelum menghubungi Anda.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard bisnis sederhana",
    description:
      "Kelola layanan, harga, portofolio, booking, dan profil tanpa harus memahami teknis website.",
  },
  {
    icon: BarChart3,
    title: "Pantau perkembangan bisnis",
    description:
      "Lihat ringkasan booking dan aktivitas utama untuk membantu pengambilan keputusan.",
  },
  {
    icon: ShieldCheck,
    title: "Data tiap MUA terpisah",
    description:
      "Setiap akun hanya mengelola data bisnisnya sendiri melalui autentikasi dan API yang aman.",
  },
];

export const platformFaqs = [
  [
    `Apakah ${siteConfig.name} bisa digunakan gratis?`,
    "Ya. Anda dapat membuat akun dan menyiapkan halaman MUA untuk mulai menerima booking.",
  ],
  [
    "Apakah saya perlu bisa membuat website?",
    "Tidak. Isi profil, layanan, dan portofolio dari dashboard; halaman publik akan terbentuk otomatis.",
  ],
  [
    "Bagaimana klien melakukan booking?",
    "Bagikan alamat halaman username Anda. Klien dapat melihat layanan lalu mengisi formulir booking tanpa harus login.",
  ],
  [
    "Apakah saya mendapatkan alamat sendiri?",
    "Ya. Setiap MUA memilih username unik, misalnya jadicantik.com/nama_mua.",
  ],
];

export default function PlatformLanding({
  authenticated,
}: {
  authenticated: boolean;
}) {
  return (
    <main className="public-light min-h-dvh overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
        <div className="container-custom flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 font-serif text-xl font-medium sm:text-2xl"
            aria-label={`${siteConfig.name} — Beranda`}
          >
            <Image
              src="/icon.png"
              alt={`Logo ${siteConfig.name}`}
              width={44}
              height={44}
              priority
              className="h-10 w-10 object-contain sm:h-11 sm:w-11"
            />
            <span className="hidden sm:inline">
              {siteConfig.name} <span className="italic text-primary">.</span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"
            aria-label="Navigasi utama"
          >
            <a href="#fitur" className="transition hover:text-foreground">
              Fitur
            </a>
            <a
              href="#cara-kerja"
              className="transition hover:text-foreground"
            >
              Cara kerja
            </a>
            <a href="#faq" className="transition hover:text-foreground">
              FAQ
            </a>
          </nav>
          <HomeAuthActions variant="header" authenticated={authenticated} />
        </div>
      </header>

      <section className="relative flex min-h-[760px] items-center pt-28">
        <div className="absolute left-1/2 top-24 -z-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="container-custom relative z-10 grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Platform bisnis untuk Makeup Artist Indonesia
            </div>
            <h1 className="mt-7 max-w-4xl font-serif text-5xl leading-[1.06] tracking-tight md:text-7xl">
              Website dan booking MUA,{" "}
              <span className="italic text-primary">
                siap dalam hitungan menit.
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              Bangun kehadiran online yang profesional, tampilkan karya terbaik,
              dan kelola booking klien dari satu dashboard yang mudah digunakan.
            </p>
            <div className="mt-9">
              <HomeAuthActions variant="hero" authenticated={authenticated} />
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {["Tanpa coding", "Username unik", "Klien tidak perlu login"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="rounded-[2rem] border border-foreground/10 bg-muted/35 p-4 shadow-2xl shadow-black/20">
              <div className="rounded-[1.4rem] border border-foreground/10 bg-background p-5">
                <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Dashboard MUA
                    </p>
                    <p className="mt-1 font-medium">Selamat datang kembali</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/25" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ["Booking bulan ini", "24"],
                    ["Pendapatan tercatat", "Rp 8,4 jt"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-foreground/10 bg-muted/30 p-4"
                    >
                      <p className="text-xs text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 text-xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-2xl border border-foreground/10 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium">Booking terbaru</p>
                    <span className="text-xs text-primary">
                      Lihat semua
                    </span>
                  </div>
                  {[
                    "Makeup Wisuda",
                    "Makeup Engagement",
                    "Makeup Photoshoot",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between border-t border-foreground/10 py-3 text-sm"
                    >
                      <span>{item}</span>
                      <span
                        className={
                          index === 0 ? "text-amber-700" : "text-emerald-700"
                        }
                      >
                        {index === 0 ? "Menunggu" : "Dikonfirmasi"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="fitur"
        className="border-y border-foreground/10 bg-muted/20 py-24"
      >
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Semua yang dibutuhkan MUA
            </p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Kelola bisnis tanpa aplikasi yang rumit
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Fokus pada klien dan hasil makeup. {siteConfig.name} membantu merapikan
              sisi digital bisnis Anda.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(
              ({
                icon: Icon,
                title: featureTitle,
                description: featureDescription,
              }) => (
                <article
                  key={featureTitle}
                  className="rounded-3xl border border-foreground/10 bg-background p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl">{featureTitle}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {featureDescription}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="py-24">
        <div className="container-custom grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Mulai dengan mudah
            </p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Dari daftar sampai siap dibagikan
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Anda tidak perlu menunggu developer atau menyiapkan hosting
              sendiri.
            </p>
          </div>
          <ol className="space-y-4">
            {[
              [
                "01",
                "Buat akun MUA",
                "Daftar dengan email atau gunakan akun Google.",
              ],
              [
                "02",
                "Lengkapi identitas bisnis",
                "Pilih username, masukkan nama brand, wilayah layanan, dan WhatsApp.",
              ],
              [
                "03",
                "Tambahkan layanan dan portofolio",
                "Tampilkan pilihan layanan serta karya terbaik Anda.",
              ],
              [
                "04",
                "Bagikan halaman ke calon klien",
                "Pasang tautan di Instagram, TikTok, WhatsApp, dan Google Business Profile.",
              ],
            ].map(([number, step, detail]) => (
              <li
                key={number}
                className="grid gap-4 rounded-2xl border border-foreground/10 p-6 sm:grid-cols-[auto_1fr]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {number}
                </span>
                <div>
                  <h3 className="font-medium">{step}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-foreground/10 bg-primary/10 py-20">
        <div className="container-custom text-center">
          <Users className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl md:text-5xl">
            Saatnya bisnis MUA Anda terlihat lebih profesional
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground">
            Mulai dari halaman publik yang mudah dibagikan hingga dashboard
            booking yang membantu pekerjaan sehari-hari.
          </p>
          <div className="mt-8">
            <HomeAuthActions variant="banner" authenticated={authenticated} />
          </div>
        </div>
      </section>

      <section id="faq" className="py-24">
        <div className="container-custom grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              FAQ
            </p>
            <h2 className="mt-4 font-serif text-4xl">
              Pertanyaan sebelum bergabung
            </h2>
          </div>
          <div className="space-y-3">
            {platformFaqs.map(([question, answer]) => (
              <details
                key={question}
                className="rounded-2xl border border-foreground/10 p-6"
              >
                <summary className="cursor-pointer font-medium">
                  {question}
                </summary>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-foreground/10 bg-muted/20">
        <div className="container-custom flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-xl">
              {siteConfig.name} <span className="text-primary">.</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Platform digital untuk Makeup Artist Indonesia.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <Link href="/area" className="hover:text-foreground">
              Cari MUA
            </Link>
            <Link href="/service" className="hover:text-foreground">
              Service MUA
            </Link>
            <Link href="/blog" className="hover:text-foreground">
              Panduan
            </Link>
            <HomeAuthActions variant="footer" authenticated={authenticated} />
            <a
              href="mailto:halo@jadicantik.com"
              className="inline-flex items-center gap-2 hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Kontak
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
