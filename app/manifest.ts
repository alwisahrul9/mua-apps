import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JadiCantik",
    short_name: "JadiCantik",
    description:
      "Platform website dan booking online untuk makeup artist Indonesia.",
    start_url: "/dashboard",
    scope: "/",
    id: "/",
    display: "standalone",
    related_applications: [
      {
        platform: "webapp",
        url: `${siteConfig.url}/manifest.webmanifest`,
        id: siteConfig.url,
      },
    ],
    background_color: "#1a1918",
    theme_color: "#1a1918",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
