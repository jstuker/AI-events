import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function CallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError('No authorization code received')
      return
    }

    const exchangeCode = async () => {
      try {
        const response = await fetch('/api/auth/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })

        const data = (await response.json()) as {
          access_token?: string
          error?: string
        }

        if (!response.ok || data.error) {
          setError(data.error ?? 'Authentication failed')
          return
        }

        if (data.access_token) {
          setToken(data.access_token)
          navigate('/events', { replace: true })
        }
      } catch {
        setError('Failed to complete authentication')
      }
    }

    exchangeCode()
  }, [searchParams, setToken, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <p className="text-red-600">{error}</p>
          <a href="/admin/login" className="mt-4 block text-blue-600 hover:underline">
            Try again
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Authenticating...</p>
    </div>
  )
}
