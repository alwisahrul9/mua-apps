"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

const subscribe = () => () => undefined;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        className="h-8 w-14 shrink-0 rounded-full border border-foreground/10 bg-muted dark:border-foreground-dark/10 dark:bg-muted-dark"
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Nonaktifkan mode gelap" : "Aktifkan mode gelap"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`group relative h-8 w-14 shrink-0 appearance-none rounded-full border transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:shadow-inner ${
        isDark
          ? "border-primary-dark/30 bg-primary-dark/30"
          : "border-foreground/10 bg-muted"
      }`}
    >
      <motion.span
        initial={false}
        animate={{ x: isDark ? 24 : 0 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.7 }}
        className="pointer-events-none absolute left-1 top-1 flex h-6 w-6 transform-gpu items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-black/5 will-change-transform dark:bg-background-dark dark:ring-white/10"
      >
        <motion.span
          initial={false}
          animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? 90 : 0, scale: isDark ? 0.5 : 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute flex items-center justify-center"
        >
          <Sun className="h-3.5 w-3.5 text-foreground" />
        </motion.span>
        <motion.span
          initial={false}
          animate={{ opacity: isDark ? 1 : 0, rotate: isDark ? 0 : -90, scale: isDark ? 1 : 0.5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute flex items-center justify-center"
        >
          <Moon className="h-3.5 w-3.5 text-foreground-dark" />
        </motion.span>
      </motion.span>
    </button>
  );
}
