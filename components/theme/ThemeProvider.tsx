'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark' // SSR fallback
  const saved = window.localStorage.getItem('theme') as Theme | null
  if (saved === 'light' || saved === 'dark') return saved
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  // Initialize theme on mount
  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  // Whenever theme changes, sync DOM, localStorage, and cookie (for SSR consistency)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      // persist locally
      window.localStorage.setItem('theme', theme)
      // persist to cookie (1 year)
      document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`
    } catch {
      // fail silently if cookies/localStorage disabled
    }
  }, [theme])

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}