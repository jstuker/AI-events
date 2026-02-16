import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Header } from './Header'

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <nav className="border-b border-gray-200 bg-white px-6">
        <a
          href="/admin/events"
          className="inline-block border-b-2 border-gray-900 px-1 py-2 text-sm font-medium text-gray-900"
        >
          Events
        </a>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
