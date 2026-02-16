import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Header } from './Header'

interface NavLinkProps {
  readonly to: string
  readonly label: string
  readonly isActive: boolean
}

function NavLink({ to, label, isActive }: NavLinkProps) {
  const activeClasses = isActive
    ? 'border-gray-900 text-gray-900'
    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'

  return (
    <Link
      to={to}
      className={`inline-block border-b-2 px-1 py-2 text-sm font-medium ${activeClasses}`}
    >
      {label}
    </Link>
  )
}

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

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

  const isDashboard = location.pathname === '/' || location.pathname === ''
  const isEvents = location.pathname.startsWith('/events')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <nav className="flex gap-4 border-b border-gray-200 bg-white px-6">
        <NavLink to="/" label="Dashboard" isActive={isDashboard} />
        <NavLink to="/events" label="Events" isActive={isEvents} />
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
