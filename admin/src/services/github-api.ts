import type {
  GitHubTreeResponse,
  GitHubBlobResponse,
  GitHubFileContent,
  GitHubUpdateResponse,
  GitHubCommitEntry,
} from "../types/github";
import { GITHUB_CONFIG } from "../config/github";

const BASE_URL = "https://api.github.com";

function repoUrl(path: string): string {
  return `${BASE_URL}/repos/${GITHUB_CONFIG.repoOwner}/${GITHUB_CONFIG.repoName}${path}`;
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, { headers: headers(token) });
  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }
  return response.json() as Promise<T>;
}

export async function getTree(token: string): Promise<GitHubTreeResponse> {
  return fetchJson<GitHubTreeResponse>(
    repoUrl(`/git/trees/${GITHUB_CONFIG.branch}?recursive=1`),
    token,
  );
}

export async function getBlob(
  token: string,
  sha: string,
): Promise<GitHubBlobResponse> {
  return fetchJson<GitHubBlobResponse>(repoUrl(`/git/blobs/${sha}`), token);
}

export async function getFileContent(
  token: string,
  path: string,
): Promise<GitHubFileContent> {
  return fetchJson<GitHubFileContent>(
    repoUrl(`/contents/${path}?ref=${GITHUB_CONFIG.branch}`),
    token,
  );
}

export async function updateFileContent(
  token: string,
  path: string,
  content: string,
  message: string,
  sha: string,
): Promise<GitHubUpdateResponse> {
  const url = repoUrl(`/contents/${path}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      sha,
      branch: GITHUB_CONFIG.branch,
    }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error(
        "Conflict: the file has been modified by another user. Please reload and try again.",
      );
    }
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<GitHubUpdateResponse>;
}

export async function createFileContent(
  token: string,
  path: string,
  contentBase64: string,
  message: string,
): Promise<GitHubUpdateResponse> {
  const url = repoUrl(`/contents/${path}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: GITHUB_CONFIG.branch,
    }),
  });

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error(
        "File already exists at this path. Delete it first or use update.",
      );
    }
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<GitHubUpdateResponse>;
}

export async function getFileCommits(
  token: string,
  path: string,
): Promise<readonly GitHubCommitEntry[]> {
  return fetchJson<readonly GitHubCommitEntry[]>(
    repoUrl(
      `/commits?path=${encodeURIComponent(path)}&sha=${GITHUB_CONFIG.branch}`,
    ),
    token,
  );
}
