export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] -mt-6">
      {children}
    </div>
  )
}
