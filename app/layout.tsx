import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'CleanOpsAI',
  description: 'Run your cleaning business like a pro.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read theme from a cookie on the server; default to "dark"
  const cookieStore = await cookies();                  // <-- await here
  const themeCookie = cookieStore.get('theme')?.value;  // e.g. "light" | "dark" | undefined
  const initialTheme = themeCookie === 'light' ? 'light' : 'dark';

  return (
    // Render data-theme on the server and suppress hydration warnings for this node
    <html lang="en" data-theme={initialTheme} suppressHydrationWarning>
      <head>
        {/* Set data-theme ASAP on the client from localStorage (or fallback to server value) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var t = saved || '${initialTheme}';
    if (t !== document.documentElement.getAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (_) {}
})();
            `.trim()
          }}
        />
      </head>
      <body>
        <Providers>
          <div className="container">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}