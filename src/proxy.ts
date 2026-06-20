import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

export async function proxy(request: NextRequest) {
  return auth(request as never)
}

export const config = {
  matcher: ['/admin/:path*'],
}
