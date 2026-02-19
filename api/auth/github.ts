import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createRateLimitMap, isRateLimited, getClientIp } from '../lib/rate-limit.js'
import { getAllowedOrigins } from '../lib/cors.js'

const rateLimitMap = createRateLimitMap()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

// GitHub OAuth codes are alphanumeric, ~20 characters
const GITHUB_CODE_PATTERN = /^[a-zA-Z0-9]{10,40}$/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // CORS origin check
  const origin = req.headers.origin
  const allowedOrigins = getAllowedOrigins()
  if (origin && !allowedOrigins.some((allowed) => origin === allowed)) {
    res.status(403).json({ error: 'Origin not allowed' })
    return
  }

  // Rate limiting by IP
  const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>)
  if (isRateLimited(rateLimitMap, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    res.setHeader('Retry-After', '60')
    res.status(429).json({ error: 'Too many requests. Please try again later.' })
    return
  }

  const { code } = req.body as { code?: string }
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Missing authorization code' })
    return
  }

  // Validate code format
  if (!GITHUB_CODE_PATTERN.test(code)) {
    console.warn(`Invalid OAuth code format from IP: ${ip}`)
    res.status(400).json({ error: 'Invalid authorization code format' })
    return
  }

  const clientId = process.env.VITE_GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'OAuth not configured' })
    return
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string }

    if (tokenData.error) {
      console.warn(`OAuth token exchange rejected for IP: ${ip}`)
      res.status(401).json({ error: tokenData.error })
      return
    }

    res.status(200).json({ access_token: tokenData.access_token })
  } catch (error) {
    console.error('OAuth token exchange failed:', error)
    res.status(500).json({ error: 'Token exchange failed' })
  }
}
