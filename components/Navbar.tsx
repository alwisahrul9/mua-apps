"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash);
    
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/#portfolio", label: "Portofolio" },
    { href: "/booking", label: "Booking" },
  ];

  const checkIsActive = (href: string) => {
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      return pathname === path && activeHash === `#${hash}`;
    }
    if (href === "/") {
      return pathname === "/" && !activeHash;
    }
    return pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5">
      <div className="container-custom mx-auto">
        <div className="flex items-center justify-between h-20">
          <Link 
            href="/" 
            onClick={() => setActiveHash("")}
            className="font-serif text-2xl font-medium tracking-tight"
          >
            Aldena's Makeup <span className="text-primary italic">.</span>
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
                    } else if (link.href === "/") {
                      setActiveHash("");
                    }
                  }}
                  className={`text-sm font-medium transition-colors hover:text-primary relative ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/booking"
              className="px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
            >
              Pesan Jadwal
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
