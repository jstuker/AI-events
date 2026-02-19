import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterPanel } from "./FilterPanel";

const defaultProps = {
  statusFilter: "" as const,
  onStatusChange: vi.fn(),
  locationFilter: "",
  onLocationChange: vi.fn(),
  locations: ["Zurich", "Geneva", "Bern"],
  featuredFilter: "",
  onFeaturedChange: vi.fn(),
  sourceFilter: "",
  onSourceChange: vi.fn(),
  sources: ["manual", "api"],
  dateFrom: "",
  onDateFromChange: vi.fn(),
  dateTo: "",
  onDateToChange: vi.fn(),
};

describe("FilterPanel", () => {
  it("renders all filter controls", () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByText("All statuses")).toBeInTheDocument();
    expect(screen.getByText("All locations")).toBeInTheDocument();
    expect(screen.getByText("All events")).toBeInTheDocument();
    expect(screen.getByText("All sources")).toBeInTheDocument();
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
  });

  it("renders status options", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("renders location options from props", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Zurich")).toBeInTheDocument();
    expect(screen.getByText("Geneva")).toBeInTheDocument();
    expect(screen.getByText("Bern")).toBeInTheDocument();
  });

  it("renders source options from props", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("manual")).toBeInTheDocument();
    expect(screen.getByText("api")).toBeInTheDocument();
  });

  it("renders featured options", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Not featured")).toBeInTheDocument();
  });

  it("calls onStatusChange when status select changes", async () => {
    const onStatusChange = vi.fn();
    render(<FilterPanel {...defaultProps} onStatusChange={onStatusChange} />);

    const statusSelect = screen.getByDisplayValue("All statuses");
    await userEvent.selectOptions(statusSelect, "published");
    expect(onStatusChange).toHaveBeenCalledWith("published");
  });

  it("calls onLocationChange when location select changes", async () => {
    const onLocationChange = vi.fn();
    render(
      <FilterPanel {...defaultProps} onLocationChange={onLocationChange} />,
    );

    const locationSelect = screen.getByDisplayValue("All locations");
    await userEvent.selectOptions(locationSelect, "Zurich");
    expect(onLocationChange).toHaveBeenCalledWith("Zurich");
  });

  it("calls onFeaturedChange when featured select changes", async () => {
    const onFeaturedChange = vi.fn();
    render(
      <FilterPanel {...defaultProps} onFeaturedChange={onFeaturedChange} />,
    );

    const featuredSelect = screen.getByDisplayValue("All events");
    await userEvent.selectOptions(featuredSelect, "yes");
    expect(onFeaturedChange).toHaveBeenCalledWith("yes");
  });

  it("calls onSourceChange when source select changes", async () => {
    const onSourceChange = vi.fn();
    render(<FilterPanel {...defaultProps} onSourceChange={onSourceChange} />);

    const sourceSelect = screen.getByDisplayValue("All sources");
    await userEvent.selectOptions(sourceSelect, "api");
    expect(onSourceChange).toHaveBeenCalledWith("api");
  });

  it("calls onDateFromChange when date from input changes", async () => {
    const onDateFromChange = vi.fn();
    render(
      <FilterPanel {...defaultProps} onDateFromChange={onDateFromChange} />,
    );

    const allDateInputs = document.querySelectorAll('input[type="date"]');
    await userEvent.type(allDateInputs[0] as HTMLElement, "2026-03-01");
    expect(onDateFromChange).toHaveBeenCalled();
  });

  it("calls onDateToChange when date to input changes", async () => {
    const onDateToChange = vi.fn();
    render(<FilterPanel {...defaultProps} onDateToChange={onDateToChange} />);

    const allDateInputs = document.querySelectorAll('input[type="date"]');
    await userEvent.type(allDateInputs[1] as HTMLElement, "2026-06-30");
    expect(onDateToChange).toHaveBeenCalled();
  });
});
