import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getGitHubAuthUrl } from "../config/github";

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
  readonly login: () => void;
  readonly logout: () => void;
  readonly setToken: (token: string) => void;
}

export const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "github_token";

async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json() as Promise<GitHubUser>;
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((newToken: string) => {
    sessionStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
    setUser(null);
  }, []);

  const login = useCallback(() => {
    window.location.href = getGitHubAuthUrl();
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      setTokenState(stored);
      fetchGitHubUser(stored)
        .then(setUser)
        .catch(() => {
          sessionStorage.removeItem(TOKEN_KEY);
          setTokenState(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && !user) {
      setIsLoading(true);
      fetchGitHubUser(token)
        .then(setUser)
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    }
  }, [token, user, logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: token !== null && user !== null,
        isLoading,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
