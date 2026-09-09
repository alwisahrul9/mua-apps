"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-[52px] h-7 rounded-full bg-muted dark:bg-muted-dark border border-foreground/5 dark:border-foreground-dark/5" />
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex h-7 w-[52px] items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isDark ? "bg-muted-dark" : "bg-muted"
      }`}
      title="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Background Icon hints (optional but looks nice) */}
      <span className="absolute left-1.5 flex h-4 w-4 items-center justify-center text-muted-foreground/50">
        <Moon className="h-3 w-3" />
      </span>
      <span className="absolute right-1.5 flex h-4 w-4 items-center justify-center text-muted-foreground/50">
        <Sun className="h-3 w-3" />
      </span>

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-background dark:bg-background-dark shadow-sm z-10 ${
          isDark ? "ml-1" : "ml-[28px]"
        }`}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-foreground-dark" />
        ) : (
          <Sun className="h-3 w-3 text-foreground" />
        )}
      </motion.div>
    </button>
  )
}
