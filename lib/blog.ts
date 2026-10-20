export type BlogSection = { heading: string; paragraphs: string[]; tips?: string[] }

export type BlogArticle = {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt: string
  sections: BlogSection[]
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "biaya-harga-jasa-mua-wisuda",
    title: "Biaya dan Harga Jasa MUA Wisuda: Panduan Sebelum Booking",
    description: "Pelajari komponen harga MUA wisuda, biaya tambahan yang perlu ditanyakan, dan cara memilih paket makeup sesuai kebutuhan.",
    publishedAt: "2026-10-18",
    updatedAt: "2026-10-18",
    sections: [
      { heading: "Apa yang memengaruhi harga MUA wisuda?", paragraphs: ["Harga makeup wisuda dipengaruhi pengalaman MUA, kualitas produk, lokasi, waktu persiapan, serta fasilitas dalam paket. Paket yang menyertakan hairdo, hijabdo, bulu mata, dan transportasi biasanya memiliki harga berbeda dari makeup saja."] },
      { heading: "Hal yang perlu ditanyakan sebelum membayar", paragraphs: ["Mintalah rincian paket secara tertulis agar Anda mengetahui layanan yang diterima dan biaya tambahan yang mungkin muncul."], tips: ["Tanyakan biaya transportasi dan waktu kedatangan.", "Pastikan kebijakan uang muka dan pembatalan.", "Konfirmasi apakah touch-up dan pemasangan aksesori termasuk.", "Lihat portofolio dengan kondisi kulit dan gaya yang serupa."] },
      { heading: "Pilih berdasarkan kebutuhan", paragraphs: ["Jangan memilih hanya dari harga terendah. Pertimbangkan kebersihan alat, kecocokan gaya, ketepatan waktu, komunikasi, dan ulasan klien. Bandingkan beberapa MUA yang melayani kota Anda sebelum booking."] },
    ],
  },
  {
    slug: "perbedaan-makeup-flawless-bold-soft-glam",
    title: "Perbedaan Makeup Flawless, Bold, dan Soft Glam untuk Lamaran",
    description: "Kenali ciri makeup flawless, bold, dan soft glam agar lebih mudah menentukan gaya rias untuk acara lamaran.",
    publishedAt: "2026-10-18",
    updatedAt: "2026-10-18",
    sections: [
      { heading: "Flawless", paragraphs: ["Makeup flawless menekankan complexion yang halus dan merata. Hasilnya dapat terlihat natural atau glam, bergantung pada warna mata dan bibir yang dipilih."] },
      { heading: "Bold", paragraphs: ["Gaya bold menggunakan definisi mata, kontur, atau warna bibir yang lebih kuat. Pilihan ini cocok untuk busana dan dekorasi yang tegas serta acara malam hari."] },
      { heading: "Soft glam", paragraphs: ["Soft glam berada di antara natural dan bold. Warna netral, bulu mata yang proporsional, dan complexion bercahaya membuat wajah tetap tegas tanpa terasa berlebihan."], tips: ["Bawa foto busana dan aksesori saat konsultasi.", "Sampaikan kondisi serta sensitivitas kulit.", "Gunakan referensi dari portofolio MUA yang akan dipilih."] },
    ],
  },
  {
    slug: "persiapan-kulit-sebelum-makeup-pernikahan",
    title: "Tips Mempersiapkan Kulit Sebelum Makeup Pernikahan",
    description: "Panduan sederhana mempersiapkan kulit menjelang hari pernikahan agar proses makeup lebih nyaman dan hasilnya optimal.",
    publishedAt: "2026-10-18",
    updatedAt: "2026-10-18",
    sections: [
      { heading: "Pertahankan rutinitas yang sudah cocok", paragraphs: ["Menjelang hari acara bukan waktu yang tepat untuk mencoba banyak produk aktif baru. Pertahankan pembersih, pelembap, dan tabir surya yang sudah terbukti cocok pada kulit Anda."] },
      { heading: "Hindari tindakan mendadak", paragraphs: ["Perawatan yang berpotensi menyebabkan iritasi sebaiknya tidak dilakukan terlalu dekat dengan hari acara. Konsultasikan tindakan kulit dengan tenaga profesional dan beri tahu MUA mengenai kondisi kulit Anda."], tips: ["Tidur cukup dan minum air secara teratur.", "Jangan memencet jerawat.", "Siapkan informasi alergi atau sensitivitas.", "Datang dengan wajah bersih sesuai arahan MUA."] },
      { heading: "Lakukan konsultasi", paragraphs: ["Kirimkan foto kondisi kulit terbaru dan referensi makeup kepada MUA. Informasi ini membantu MUA mempersiapkan produk serta waktu pengerjaan yang sesuai."] },
    ],
  },
  {
    slug: "cara-memilih-mua-pengantin",
    title: "Cara Memilih MUA Pengantin yang Tepat dan Tahan Lama",
    description: "Checklist memilih MUA pengantin berdasarkan portofolio, kebersihan, komunikasi, jadwal, harga, dan kebutuhan acara.",
    publishedAt: "2026-10-18",
    updatedAt: "2026-10-18",
    sections: [
      { heading: "Periksa portofolio yang relevan", paragraphs: ["Cari hasil makeup pada bentuk wajah, warna kulit, dan gaya busana yang mendekati kebutuhan Anda. Perhatikan foto dalam pencahayaan berbeda dan konsistensi hasil pada beberapa klien."] },
      { heading: "Nilai proses kerjanya", paragraphs: ["MUA yang baik menjelaskan isi paket, jadwal, biaya, kebijakan pembatalan, dan kebutuhan persiapan secara jelas."], tips: ["Pastikan alat dan aplikator dijaga kebersihannya.", "Konfirmasi siapa yang akan mengerjakan makeup.", "Tanyakan durasi pengerjaan dan jadwal kedatangan.", "Simpan bukti kesepakatan serta pembayaran."] },
      { heading: "Pertimbangkan tes makeup", paragraphs: ["Untuk acara penting, tes makeup membantu menyamakan ekspektasi mengenai warna, tingkat ketebalan, dan kenyamanan produk sebelum hari acara."] },
    ],
  },
]

export function getBlogArticle(slug: string) {
  return blogArticles.find((article) => article.slug === slug)
}
