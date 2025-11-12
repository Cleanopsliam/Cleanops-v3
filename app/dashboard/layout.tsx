import Link from 'next/link'
import type { ReactNode } from 'react'

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/scheduling', label: 'Scheduling' },
  { href: '/dashboard/clients', label: 'Clients' },
  { href: '/dashboard/staff', label: 'Staff' },
  { href: '/dashboard/invoices', label: 'Invoices' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container">
      <div className="nav-glass mt-4 rounded-xl">
        <div className="container flex items-center gap-2 py-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="btn-secondary btn-sm">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}