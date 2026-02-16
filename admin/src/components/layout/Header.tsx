import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">
            Swiss &#123;ai&#125; Weeks
          </h1>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            Admin
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-7 w-7 rounded-full"
            />
            <span className="text-sm text-gray-600">{user.name ?? user.login}</span>
            <button
              onClick={logout}
              className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
