"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

export function Navbar({
  username,
  brandName = siteConfig.name,
  lightMode = true,
}: {
  username?: string;
  brandName?: string;
  lightMode?: boolean;
}) {
  const pathname = usePathname();
  const homeHref = username ? `/${username}` : "/";
  const [activeHash, setActiveHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash,
  );

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const navLinks = username
    ? [
        { href: homeHref, label: "Beranda" },
        { href: `${homeHref}#about`, label: "Tentang" },
        { href: `${homeHref}#services`, label: "Layanan" },
        { href: `${homeHref}#portfolio`, label: "Portofolio" },
        { href: `${homeHref}#faq`, label: "FAQ" },
        { href: `${homeHref}/booking`, label: "Booking" },
      ]
    : [
        { href: "/", label: "Beranda" },
        { href: "/#fitur", label: "Fitur" },
        { href: "/#cara-kerja", label: "Cara Kerja" },
        { href: "/#faq", label: "FAQ" },
      ];

  const checkIsActive = (href: string) => {
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      return pathname === path && activeHash === `#${hash}`;
    }
    if (href === homeHref) {
      return pathname === homeHref && !activeHash;
    }
    return pathname === href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${
        lightMode
          ? "border-foreground/5 bg-background/85 text-foreground"
          : "border-foreground-dark/5 bg-background-dark/80"
      }`}
    >
      <div className="container-custom mx-auto">
        <div className="flex items-center justify-between h-20">
          <Link
            href={homeHref}
            onClick={() => setActiveHash("")}
            className="font-serif text-2xl font-medium tracking-tight"
          >
            {brandName}{" "}
            <span className={`${lightMode ? "text-primary" : "text-primary-dark"} italic`}>
              .
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.href.includes("#")) {
                      setActiveHash("#" + link.href.split("#")[1]);
                    } else if (link.href === homeHref) {
                      setActiveHash("");
                    }
                  }}
                  className={`relative text-sm font-medium transition-colors ${
                    lightMode ? "hover:text-primary" : "hover:text-primary-dark"
                  } ${
                    isActive
                      ? lightMode
                        ? "text-primary"
                        : "text-primary-dark"
                      : lightMode
                        ? "text-muted-foreground"
                        : "text-muted-foreground-dark"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className={`absolute -bottom-1 left-0 right-0 h-[2px] rounded-full ${lightMode ? "bg-primary" : "bg-primary-dark"}`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href={username ? `${homeHref}/booking` : "/register"}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                lightMode
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-foreground-dark text-background-dark hover:bg-foreground-dark/90"
              }`}
            >
              {username ? "Pesan Jadwal" : "Daftar Gratis"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
