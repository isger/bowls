import type { NextAuthConfig } from 'next-auth'

type Role = 'admin' | 'member'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token['role'] = (user as { role: Role }).role
      return token
    },
    session({ session, token }) {
      session.user.role = (token['role'] as Role) ?? 'member'
      if (token.sub) session.user.id = token.sub
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      if (isAdminRoute) {
        return auth?.user?.role === 'admin'
      }
      return true
    },
  },
}
