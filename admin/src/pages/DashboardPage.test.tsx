import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardPage } from "./DashboardPage";
import { createEvent } from "../test/fixtures";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ token: "test-token" }),
}));

vi.mock("../services/event-service", () => ({
  fetchAllEvents: vi.fn(),
}));

import { fetchAllEvents } from "../services/event-service";

const mockFetchAllEvents = vi.mocked(fetchAllEvents);

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    mockFetchAllEvents.mockReturnValue(new Promise(() => {}));
    renderDashboard();

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("shows error state with retry button", async () => {
    mockFetchAllEvents.mockRejectedValueOnce(new Error("Network error"));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("renders the four stat cards", async () => {
    const events = [
      createEvent({
        event_id: "1",
        status: "published",
        event_start_date: "2099-01-01",
      }),
      createEvent({
        event_id: "2",
        status: "review",
        event_start_date: "2099-02-01",
      }),
      createEvent({
        event_id: "3",
        status: "draft",
        event_start_date: "2099-03-01",
      }),
    ];
    mockFetchAllEvents.mockResolvedValueOnce(events);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Pending Draft")).toBeInTheDocument();
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
    expect(screen.getByText("Duplicates")).toBeInTheDocument();
  });

  it("renders Events to Review table with draft and review events", async () => {
    const events = [
      createEvent({
        event_id: "1",
        status: "draft",
        event_name: "Draft Event Alpha",
        event_start_date: "2099-05-01",
        location_name: "Bern",
      }),
      createEvent({
        event_id: "2",
        status: "review",
        event_name: "Review Event Beta",
        event_start_date: "2099-09-15",
        location_name: "Geneva",
      }),
    ];
    mockFetchAllEvents.mockResolvedValueOnce(events);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Events to Review")).toBeInTheDocument();
    });
    expect(screen.getByText("Draft Event Alpha")).toBeInTheDocument();
    expect(screen.getByText("Review Event Beta")).toBeInTheDocument();
  });

  it("renders Upcoming Events table", async () => {
    const events = [
      createEvent({
        event_id: "1",
        status: "published",
        event_name: "Future Event",
        event_start_date: "2099-06-01",
      }),
    ];
    mockFetchAllEvents.mockResolvedValueOnce(events);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
    });
    expect(screen.getByText("Future Event")).toBeInTheDocument();
  });

  it("renders View All Events link", async () => {
    mockFetchAllEvents.mockResolvedValueOnce([]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("View All Events")).toBeInTheDocument();
    });

    const link = screen.getByRole("link", { name: "View All Events" });
    expect(link).toHaveAttribute("href", "/events");
  });

  it("shows duplicates panel when duplicate events exist", async () => {
    const events = [
      createEvent({
        event_id: "1",
        event_name: "Zurich AI Hackathon",
        event_start_date: "2099-06-15",
        location_name: "Zurich",
      }),
      createEvent({
        event_id: "2",
        event_name: "Zürich AI Hackathon",
        event_start_date: "2099-06-15",
        location_name: "Zurich",
      }),
    ];
    mockFetchAllEvents.mockResolvedValueOnce(events);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Potential Duplicates/)).toBeInTheDocument();
    });
  });
});
