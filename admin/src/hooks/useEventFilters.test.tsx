import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { useEventFilters } from "./useEventFilters";
import { createEvents } from "../test/fixtures";

function createWrapper(initialEntries = ["/events"]) {
  return function Wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    );
  };
}

describe("useEventFilters", () => {
  const events = createEvents();

  it("returns all events when no filters are set", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    expect(result.current.filteredEvents).toHaveLength(3);
    expect(result.current.search).toBe("");
    expect(result.current.statusFilter).toBe("");
  });

  it("initializes status filter from URL search params", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(["/events?status=draft"]),
    });

    expect(result.current.statusFilter).toBe("draft");
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0]!.status).toBe("draft");
  });

  it("ignores invalid status values in URL", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(["/events?status=bogus"]),
    });

    expect(result.current.statusFilter).toBe("");
    expect(result.current.filteredEvents).toHaveLength(3);
  });

  it("filters by search term", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSearch("hackathon");
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0]!.event_name).toBe(
      "Zurich AI Hackathon",
    );
  });

  it("filters by status", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setStatusFilter("draft");
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0]!.status).toBe("draft");
  });

  it("filters by location", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setLocationFilter("Geneva");
    });

    expect(result.current.filteredEvents).toHaveLength(1);
  });

  it("filters by featured", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setFeaturedFilter("yes");
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0]!.featured).toBe(true);
  });

  it("filters by source", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSourceFilter("api");
    });

    expect(result.current.filteredEvents).toHaveLength(1);
  });

  it("filters by date range", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setDateFrom("2026-04-01");
      result.current.setDateTo("2026-04-30");
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0]!.event_name).toBe(
      "Geneva ML Workshop",
    );
  });

  it("toggles sort direction when clicking same field", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    expect(result.current.sortField).toBe("event_start_date");
    expect(result.current.sortDirection).toBe("asc");

    act(() => {
      result.current.handleSort("event_start_date");
    });

    expect(result.current.sortDirection).toBe("desc");
  });

  it("changes sort field and resets direction to asc", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleSort("event_start_date"); // toggle to desc
    });
    expect(result.current.sortDirection).toBe("desc");

    act(() => {
      result.current.handleSort("event_name"); // new field, resets to asc
    });

    expect(result.current.sortField).toBe("event_name");
    expect(result.current.sortDirection).toBe("asc");
  });

  it("combines multiple filters", () => {
    const { result } = renderHook(() => useEventFilters(events), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSourceFilter("manual");
      result.current.setStatusFilter("published");
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0]!.event_name).toBe(
      "Zurich AI Hackathon",
    );
  });
});
