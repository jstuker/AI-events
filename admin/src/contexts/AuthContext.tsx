import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getGitHubAuthUrl, GITHUB_CONFIG } from "../config/github";

interface GitHubUser {
  readonly login: string;
  readonly avatar_url: string;
  readonly name: string | null;
}

interface AuthState {
  readonly token: string | null;
  readonly user: GitHubUser | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly authError: string | null;
  readonly login: () => void;
  readonly logout: () => void;
  readonly setToken: (token: string) => void;
}

export const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "github_token";
const TOKEN_TIMESTAMP_KEY = "github_token_ts";
const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch user");

  // Validate that the token has the required 'repo' scope
  const scopes = response.headers.get("X-OAuth-Scopes") ?? "";
  const grantedScopes = scopes.split(",").map((s) => s.trim());
  if (!grantedScopes.includes("repo")) {
    throw new Error(
      "Insufficient permissions: the 'repo' scope is required. Please log in again and grant repository access.",
    );
  }

  return response.json() as Promise<GitHubUser>;
}

async function validateRepoAccess(token: string, login: string): Promise<void> {
  const { repoOwner, repoName } = GITHUB_CONFIG;
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${login}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (response.status === 404 || response.status === 403) {
    throw new Error(
      `Access denied: you do not have write access to ${repoOwner}/${repoName}. Please request access from the repository owner.`,
    );
  }
  if (!response.ok) {
    throw new Error("Failed to verify repository access");
  }
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const setToken = useCallback((newToken: string) => {
    sessionStorage.setItem(TOKEN_KEY, newToken);
    sessionStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
    setAuthError(null);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
    setTokenState(null);
    setUser(null);
    setAuthError(null);
  }, []);

  const login = useCallback(() => {
    window.location.href = getGitHubAuthUrl();
  }, []);

  const authenticateUser = useCallback(async (authToken: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const githubUser = await fetchGitHubUser(authToken);
      await validateRepoAccess(authToken, githubUser.login);
      setUser(githubUser);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setAuthError(message);
      sessionStorage.removeItem(TOKEN_KEY);
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    const timestamp = sessionStorage.getItem(TOKEN_TIMESTAMP_KEY);
    const isExpired =
      !timestamp || Date.now() - parseInt(timestamp, 10) > TOKEN_MAX_AGE_MS;

    if (stored && !isExpired) {
      setTokenState(stored);
      authenticateUser(stored);
    } else {
      if (stored) {
        // Token expired, clean up
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
      }
      setIsLoading(false);
    }
  }, [authenticateUser]);

  useEffect(() => {
    if (token && !user && !authError) {
      authenticateUser(token);
    }
  }, [token, user, authError, authenticateUser]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: token !== null && user !== null,
        isLoading,
        authError,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
