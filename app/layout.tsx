import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SerwistProvider } from "@serwist/next/react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} - Platform Bisnis MUA`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Platform website, portofolio, layanan, dan booking online untuk makeup artist Indonesia.",
  category: "business",
  creator: siteConfig.name,
  publisher: siteConfig.name,
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JadiCantik",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "scroll-smooth",
        inter.variable,
        playfair.variable,
        "font-sans",
      )}
    >
      <head />
      <body className="min-h-full flex flex-col font-sans bg-background-dark text-foreground-dark selection:bg-primary/30">
        <SerwistProvider swUrl="/sw.js">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
