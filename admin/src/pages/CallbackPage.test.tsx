import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CallbackPage } from "./CallbackPage";
import { validateOAuthState } from "../config/github";

const mockSetToken = vi.fn();
const mockNavigate = vi.fn();
let mockIsAuthenticated = false;

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    setToken: mockSetToken,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

vi.mock("../config/github", () => ({
  validateOAuthState: vi.fn(() => true),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderCallback(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/callback${search}`]}>
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
    globalThis.fetch = vi.fn();
  });

  describe("OAuth state validation", () => {
    it("shows CSRF error when state is invalid", async () => {
      vi.mocked(validateOAuthState).mockReturnValueOnce(false);
      renderCallback("?code=test-code&state=bad-state");

      await waitFor(() => {
        expect(screen.getByText(/possible CSRF attack/)).toBeInTheDocument();
      });
    });
  });

  describe("missing authorization code", () => {
    it("shows error when no code parameter", async () => {
      renderCallback();

      await waitFor(() => {
        expect(
          screen.getByText("No authorization code received"),
        ).toBeInTheDocument();
      });
    });

    it("shows try again link on error", async () => {
      renderCallback();

      await waitFor(() => {
        expect(screen.getByText("Try again")).toBeInTheDocument();
      });

      const link = screen.getByText("Try again");
      expect(link).toHaveAttribute("href", "/admin/login");
    });
  });

  describe("authenticating state", () => {
    it("shows authenticating message while exchanging code", () => {
      vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}));
      renderCallback("?code=test-auth-code");

      expect(screen.getByText("Authenticating...")).toBeInTheDocument();
    });
  });

  describe("successful authentication", () => {
    it("exchanges code and calls setToken", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "gh-token-123" }),
      } as Response);

      renderCallback("?code=valid-code");

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/auth/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "valid-code" }),
        });
      });

      await waitFor(() => {
        expect(mockSetToken).toHaveBeenCalledWith("gh-token-123");
      });
    });

    it("navigates to events when isAuthenticated becomes true", () => {
      mockIsAuthenticated = true;
      vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}));
      renderCallback("?code=valid-code");

      expect(mockNavigate).toHaveBeenCalledWith("/events", { replace: true });
    });
  });

  describe("failed authentication", () => {
    it("shows error when API returns error response", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid code" }),
      } as Response);

      renderCallback("?code=bad-code");

      await waitFor(() => {
        expect(screen.getByText("Invalid code")).toBeInTheDocument();
      });

      expect(mockSetToken).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows generic error when API returns non-ok without error field", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      } as Response);

      renderCallback("?code=bad-code");

      await waitFor(() => {
        expect(screen.getByText("Authentication failed")).toBeInTheDocument();
      });
    });

    it("shows error when response has error field even if ok", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ error: "Token expired" }),
      } as Response);

      renderCallback("?code=expired-code");

      await waitFor(() => {
        expect(screen.getByText("Token expired")).toBeInTheDocument();
      });
    });

    it("shows error when fetch throws", async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(
        new Error("Network failure"),
      );

      renderCallback("?code=valid-code");

      await waitFor(() => {
        expect(
          screen.getByText("Failed to complete authentication"),
        ).toBeInTheDocument();
      });
    });

    it("shows try again link on authentication failure", async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error("fail"));

      renderCallback("?code=valid-code");

      await waitFor(() => {
        expect(screen.getByText("Try again")).toBeInTheDocument();
      });
    });
  });
});
