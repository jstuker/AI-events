export const GITHUB_CONFIG = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID ?? "",
  repoOwner: "jstuker",
  repoName: "AI-events",
  contentPath: "content/events",
  branch: "main",
} as const;

export const OAUTH_REDIRECT_URI = `${window.location.origin}/admin/callback`;

const OAUTH_STATE_KEY = "oauth_state";

export function generateOAuthState(): string {
  const state = crypto.randomUUID();
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  return state;
}

export function validateOAuthState(returnedState: string | null): boolean {
  const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  return storedState !== null && returnedState === storedState;
}

export function getGitHubAuthUrl(): string {
  const state = generateOAuthState();
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.clientId,
    redirect_uri: OAUTH_REDIRECT_URI,
    scope: "repo",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
