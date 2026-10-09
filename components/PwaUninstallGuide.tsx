import { ExternalLink, Monitor, Smartphone } from "lucide-react";

const uninstallGuides = [
  {
    title: "Smartphone dan tablet",
    icon: Smartphone,
    platforms: [
      {
        name: "iPhone atau iPad (Safari)",
        steps: [
          "Cari ikon JadiCantik di Layar Utama atau App Library.",
          "Tekan dan tahan ikon sampai menu tindakan muncul.",
          "Pilih Hapus App atau Hapus Penanda, sesuai versi iOS/iPadOS.",
          "Ketuk Hapus untuk mengonfirmasi.",
        ],
      },
      {
        name: "Android (Chrome atau Edge)",
        steps: [
          "Cari ikon JadiCantik di layar utama atau daftar aplikasi.",
          "Tekan dan tahan ikon, lalu pilih Info aplikasi atau Copot pemasangan.",
          "Jika halaman Info aplikasi terbuka, ketuk Copot pemasangan.",
          "Ketuk OK untuk mengonfirmasi penghapusan.",
        ],
      },
    ],
  },
  {
    title: "Desktop dan laptop",
    icon: Monitor,
    platforms: [
      {
        name: "Google Chrome",
        steps: [
          "Buka aplikasi JadiCantik yang sudah terpasang.",
          "Klik menu tiga titik pada bagian atas aplikasi.",
          "Pilih Uninstall JadiCantik atau Copot pemasangan JadiCantik.",
          "Pilih apakah data aplikasi juga ingin dihapus, lalu klik Hapus.",
        ],
      },
      {
        name: "Microsoft Edge",
        steps: [
          "Buka Edge, ketik edge://apps pada kolom alamat, lalu tekan Enter.",
          "Temukan JadiCantik, lalu klik Detail atau menu tiga titik pada aplikasi.",
          "Pilih Uninstall atau Copot pemasangan.",
          "Konfirmasi penghapusan pada dialog yang muncul.",
        ],
      },
      {
        name: "Safari di macOS",
        steps: [
          "Tutup aplikasi JadiCantik jika masih terbuka.",
          "Buka Finder, lalu pilih Applications (Aplikasi) pada sidebar.",
          "Temukan JadiCantik, lalu pindahkan ke Trash (Tong Sampah).",
          "Kosongkan Trash jika ingin menghapusnya secara permanen.",
        ],
      },
    ],
  },
];

export default function PwaUninstallGuide() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        {uninstallGuides.map(({ title, icon: Icon, platforms }) => (
          <section
            key={title}
            className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
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
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
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

      <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground dark:text-muted-foreground-dark">
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Nama dan posisi menu dapat sedikit berbeda, tergantung versi sistem
        operasi dan browser. Menghapus aplikasi tidak menghapus akun JadiCantik
        atau data yang tersimpan di server.
      </p>
    </div>
  );
}
