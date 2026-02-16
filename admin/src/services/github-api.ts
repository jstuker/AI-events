import type { GitHubTreeResponse, GitHubBlobResponse } from '../types/github'
import { GITHUB_CONFIG } from '../config/github'

const BASE_URL = 'https://api.github.com'

function repoUrl(path: string): string {
  return `${BASE_URL}/repos/${GITHUB_CONFIG.repoOwner}/${GITHUB_CONFIG.repoName}${path}`
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, { headers: headers(token) })
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

export async function getTree(token: string): Promise<GitHubTreeResponse> {
  return fetchJson<GitHubTreeResponse>(
    repoUrl(`/git/trees/${GITHUB_CONFIG.branch}?recursive=1`),
    token,
  )
}

export async function getBlob(token: string, sha: string): Promise<GitHubBlobResponse> {
  return fetchJson<GitHubBlobResponse>(
    repoUrl(`/git/blobs/${sha}`),
    token,
  )
}
