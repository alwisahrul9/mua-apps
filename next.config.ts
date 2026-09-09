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
};

export default nextConfig;
