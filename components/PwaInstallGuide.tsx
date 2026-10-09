import { Monitor, Smartphone } from "lucide-react";

type PwaInstallGuideProps = {
  compact?: boolean;
};

const guides = [
  {
    title: "Smartphone dan tablet",
    icon: Smartphone,
    platforms: [
      {
        name: "iPhone atau iPad (Safari)",
        steps: [
          "Buka dashboard JadiCantik menggunakan Safari.",
          "Ketuk ikon Bagikan (kotak dengan panah ke atas) pada toolbar Safari.",
          "Geser pilihan ke bawah, lalu ketuk Tambahkan ke Layar Utama.",
          "Periksa nama aplikasi, ketuk Tambah, lalu buka dari Layar Utama.",
        ],
      },
      {
        name: "Android (Chrome)",
        steps: [
          "Buka dashboard JadiCantik menggunakan Chrome.",
          "Ketuk menu tiga titik di pojok kanan atas.",
          "Pilih Instal aplikasi atau Tambahkan ke layar utama.",
          "Ketuk Instal, lalu buka dari layar utama atau daftar aplikasi.",
        ],
      },
    ],
  },
  {
    title: "Desktop dan laptop",
    icon: Monitor,
    platforms: [
      {
        name: "Chrome atau Microsoft Edge",
        steps: [
          "Buka dashboard JadiCantik di Chrome atau Microsoft Edge.",
          "Klik ikon instal di sisi kanan kolom alamat. Jika tidak muncul, buka menu tiga titik dan pilih Instal JadiCantik.",
          "Klik Instal pada dialog konfirmasi.",
          "Buka aplikasi dari desktop, Dock, Start, atau folder Applications.",
        ],
      },
      {
        name: "Safari di macOS",
        steps: [
          "Buka dashboard JadiCantik menggunakan Safari.",
          "Pada bar menu, pilih File lalu Add to Dock (Tambahkan ke Dock).",
          "Periksa nama aplikasi, kemudian klik Add.",
          "Buka JadiCantik dari Dock atau folder Applications.",
        ],
      },
    ],
  },
];

export default function PwaInstallGuide({
  compact = false,
}: PwaInstallGuideProps) {
  return (
    <div className={`grid gap-3 ${compact ? "" : "lg:grid-cols-2"}`}>
      {guides.map(({ title, icon: Icon, platforms }) => (
        <section
          key={title}
          className="rounded-2xl border border-foreground/10 bg-muted/40 p-4 dark:border-foreground-dark/10 dark:bg-muted-dark/40"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>

          <div className="space-y-4">
            {platforms.map((platform) => (
              <div key={platform.name}>
                <p className="mb-2 text-xs font-semibold text-muted-foreground dark:text-muted-foreground-dark">
                  {platform.name}
                </p>
                <ol className="space-y-2">
                  {platform.steps.map((instruction, index) => (
                    <li
                      key={instruction}
                      className="flex gap-2 text-xs leading-5 sm:text-sm"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
