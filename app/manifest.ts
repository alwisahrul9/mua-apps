import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aldena's Makeup",
    short_name: "Aldena's MUA",
    description: "Layanan makeup eksklusif untuk pertunangan, wisuda, dan momen spesial Anda.",
    start_url: '/login',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e85c5cff',
    icons: [
      {
        src: 'https://nmntjgnmnzaekithicay.supabase.co/storage/v1/object/public/portfolios/images/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://nmntjgnmnzaekithicay.supabase.co/storage/v1/object/public/portfolios/images/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
