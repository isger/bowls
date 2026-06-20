'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  function validateEmail(v: string) {
    if (!v.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address'
  }

  function validatePassword(v: string) {
    if (!v) return 'Password is required'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = { email: validateEmail(email), password: validatePassword(password) }
    setFieldErrors(errs)
    if (errs.email || errs.password) return
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/logo.png" alt="Ferndown Bowls Club" width={80} height={80} className="rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="text-base text-slate-500 mt-1">Ferndown Bowls Club</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
              onBlur={(e) => setFieldErrors((p) => ({ ...p, email: validateEmail(e.target.value) }))}
              placeholder="you@example.com"
              className={`h-12 text-base ${fieldErrors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
            />
            {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })) }}
              onBlur={(e) => setFieldErrors((p) => ({ ...p, password: validatePassword(e.target.value) }))}
              className={`h-12 text-base ${fieldErrors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
            />
            {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
          </div>

          {error && (
            <p className="text-base text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-medium">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
            {loading && <Loader2 size={18} className="animate-spin mr-2" />}
            Sign in
          </Button>
        </form>

        <p className="text-base text-center text-slate-400">
          <Link href="/" className="underline hover:text-slate-600">
            Continue without signing in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
