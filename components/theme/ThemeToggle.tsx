'use client'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm hover:opacity-90"
    >
      <span className="text-xs opacity-70">{isDark ? 'Dark' : 'Light'}</span>

      {/* Track */}
      <span
        className="relative h-4 w-7 rounded-full"
        style={{ background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)' }}
      >
        {/* Knob */}
        <span
          className={[
            'absolute top-0.5 left-0.5 h-3 w-3 rounded-full transition-transform duration-200',
            // move exactly 14px (translate-x-3.5) so the 12px knob sits flush within a 28px track with 2px padding
            isDark ? 'translate-x-3.5 bg-white' : 'translate-x-0 bg-black/80',
          ].join(' ')}
        />
      </span>
    </button>
  )
}