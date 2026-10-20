import Link from "next/link"
import { CheckSquare2, ExternalLink, MapPinned } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GoogleBusinessGuideCard({
  publicProfileUrl,
}: {
  publicProfileUrl?: string
}) {
  const steps = [
    <>Gunakan nama bisnis, nomor WhatsApp, alamat, dan area layanan yang sama dengan Pengaturan Profil.</>,
    <>
      Pasang {publicProfileUrl ? <Link href={publicProfileUrl} target="_blank" className="font-medium text-primary underline underline-offset-4 dark:text-primary-dark">URL profil MUA Anda</Link> : "URL profil MUA Anda"} pada kolom <strong>Website</strong> di Google Business Profile.
    </>,
    <>Cantumkan tautan profil yang sama di bio Instagram dan TikTok.</>,
    <>Lengkapi kategori bisnis, jam operasional, area layanan, foto karya, dan layanan yang tersedia.</>,
    <>Minta ulasan dari klien nyata setelah booking selesai dan tanggapi ulasannya.</>,
  ]

  return (
    <Card className="rounded-2xl border-primary/15">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-serif text-xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark"><MapPinned className="h-5 w-5" /></span>
          Tingkatkan Klien dari Google
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground dark:text-muted-foreground-dark">Hubungkan profil publik JadiCantik dengan profil bisnis resmi Anda agar informasi bisnis konsisten di hasil pencarian lokal.</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {steps.map((step, index) => <li key={index} className="flex items-start gap-3 text-sm leading-6"><CheckSquare2 className="mt-1 h-4 w-4 shrink-0 text-primary dark:text-primary-dark" /><span>{step}</span></li>)}
        </ul>
        <a href="https://www.google.com/business/" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline dark:text-primary-dark">Buka Google Business Profile <ExternalLink className="h-4 w-4" /></a>
      </CardContent>
    </Card>
  )
}
