import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user) redirect('/')

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] -mt-6">
      {children}
    </div>
  )
}
