export const GITHUB_CONFIG = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID ?? '',
  repoOwner: 'jstuker',
  repoName: 'AI-events',
  contentPath: 'content/events',
  branch: 'main',
} as const

export const OAUTH_REDIRECT_URI = `${window.location.origin}/admin/callback`

export function getGitHubAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.clientId,
    redirect_uri: OAUTH_REDIRECT_URI,
    scope: 'repo',
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}
