import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 't0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'nmntjgnmnzaekithicay.supabase.co'
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // 👈 Tambahkan baris ini
    },
  },
};

export default nextConfig;
