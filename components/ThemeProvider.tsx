"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = Exclude<Theme, "system">

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)
const STORAGE_KEY = "theme"

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function storedTheme(fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === "light" || value === "dark" || value === "system"
      ? value
      : fallback
  } catch {
    return fallback
  }
}

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark")
  document.documentElement.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: {
  children: React.ReactNode
  attribute?: "class"
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}) {
  const fallbackTheme = enableSystem ? defaultTheme : "light"
  const [theme, setThemeState] = React.useState<Theme>(() =>
    storedTheme(fallbackTheme),
  )
  const currentSystemTheme = React.useSyncExternalStore(
    subscribeToSystemTheme,
    systemTheme,
    () => "dark" as const,
  )
  const resolvedTheme = theme === "system" ? currentSystemTheme : theme

  React.useLayoutEffect(() => {
    let style: HTMLStyleElement | null = null
    if (disableTransitionOnChange) {
      style = document.createElement("style")
      style.textContent = "*,*::before,*::after{transition:none!important}"
      document.head.appendChild(style)
    }

    applyTheme(resolvedTheme)
    if (style) {
      window.getComputedStyle(document.body)
      style.remove()
    }

  }, [disableTransitionOnChange, resolvedTheme])

  const setTheme = React.useCallback((nextTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // Tema tetap berlaku pada sesi ini ketika storage tidak tersedia.
    }
    setThemeState(nextTheme)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider")
  }
  return context
}
