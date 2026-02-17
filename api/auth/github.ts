import type { VercelRequest, VercelResponse } from '@vercel/node'

// Simple in-memory rate limiting (resets on cold start, but still useful)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

// GitHub OAuth codes are alphanumeric, ~20 characters
const GITHUB_CODE_PATTERN = /^[a-zA-Z0-9]{10,40}$/

function getAllowedOrigins(): readonly string[] {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const origins: string[] = ['https://ai-weeks.ch']
  if (vercelUrl) {
    origins.push(`https://${vercelUrl}`)
  }
  // Allow preview deployment origins
  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL
  if (vercelBranchUrl) {
    origins.push(`https://${vercelBranchUrl}`)
  }
  const vercelDeployUrl = process.env.VERCEL_URL
  if (vercelDeployUrl) {
    origins.push(`https://${vercelDeployUrl}`)
  }
  return origins
}

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
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
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
