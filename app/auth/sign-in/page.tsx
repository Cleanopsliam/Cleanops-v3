import Link from 'next/link'
import { AuthForm } from '@/components/AuthForm'

export default function SignInPage() {
  return (
    <div className="grid gap-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-white/70">Sign in to access your dashboard.</p>
      </div>
      <AuthForm mode="sign-in" />
      <p className="text-white/60 text-sm">
        No account? <Link href="/auth/sign-up" className="underline">Create one</Link>
      </p>
    </div>
  )
}
