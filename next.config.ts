import type { NextConfig } from "next";

const appName =
  process.env.APP_ENV?.trim().toLowerCase() === "development"
    ? "JadiCantik Dev"
    : "JadiCantik";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/kota/:path*",
        destination: "/area/:path*",
        permanent: true,
      },
      {
        source: "/layanan/:path*",
        destination: "/service/:path*",
        permanent: true,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_NAME: appName,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "t0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // 👈 Tambahkan baris ini
    },
  },
};

export default nextConfig;
