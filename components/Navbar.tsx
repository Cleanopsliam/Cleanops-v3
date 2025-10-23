'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/theme/ThemeToggle'

export function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <header className="nav-glass">
      <nav className="container flex items-center justify-between py-3">
        {/* Left: brand + primary links */}
        <div className="flex items-center gap-5">
          <Link href="/" className="font-semibold tracking-tight">
            CleanOpsAI
          </Link>

          {/* Turn Dashboard into a proper button */}
          <Link
            href="/dashboard"
            className={`btn-sm ${
              isActive('/dashboard')
                ? 'btn text-white' // gradient + white text
                : 'btn-secondary'
            }`}
          >
            Dashboard
          </Link>
        </div>

        {/* Right: utilities */}
        <div className="flex items-center gap-3">
          {/* add more links later if needed */}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}