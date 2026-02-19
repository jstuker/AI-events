import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventDetailView } from "./EventDetailView";
import { createEvent } from "../../test/fixtures";

describe("EventDetailView", () => {
  it("renders event name", () => {
    const event = createEvent({ event_name: "AI Summit 2026" });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("AI Summit 2026")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    const event = createEvent({ status: "published" });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("published")).toBeInTheDocument();
  });

  it("renders location info", () => {
    const event = createEvent({
      location_name: "Zurich",
      location_address: "Bahnhofstrasse 1",
    });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("Zurich")).toBeInTheDocument();
    expect(screen.getByText("Bahnhofstrasse 1")).toBeInTheDocument();
  });

  it("renders organizer info", () => {
    const event = createEvent({
      organizer_name: "SwissAI",
      organizer_url: "https://swissai.ch",
    });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("SwissAI")).toBeInTheDocument();
    expect(screen.getByText("https://swissai.ch")).toBeInTheDocument();
  });

  it("renders pricing for free event", () => {
    const event = createEvent({ event_price_type: "free" });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders pricing for paid event", () => {
    const event = createEvent({
      event_price_type: "paid",
      event_price: 50,
      event_price_currency: "CHF",
    });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("CHF 50")).toBeInTheDocument();
  });

  it("renders pricing for range event", () => {
    const event = createEvent({
      event_price_type: "range",
      event_low_price: 20,
      event_high_price: 100,
      event_price_currency: "CHF",
    });
    render(<EventDetailView event={event} />);
    expect(screen.getByText(/CHF 20/)).toBeInTheDocument();
  });

  it("renders tags", () => {
    const event = createEvent({ tags: ["ai", "tech"] });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("ai, tech")).toBeInTheDocument();
  });

  it("renders featured status", () => {
    const event = createEvent({ featured: true, featured_type: "badge" });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("badge")).toBeInTheDocument();
  });

  it("renders body content", () => {
    const event = createEvent({ body: "Event description here" });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("Event description here")).toBeInTheDocument();
  });

  it("does not render body section when body is empty", () => {
    const event = createEvent({ body: "" });
    render(<EventDetailView event={event} />);
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders section headers", () => {
    const event = createEvent();
    render(<EventDetailView event={event} />);
    expect(screen.getByText("Metadata")).toBeInTheDocument();
    expect(screen.getByText("Event Details")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Organizer & Contact")).toBeInTheDocument();
    expect(screen.getByText("Promotion")).toBeInTheDocument();
  });

  it("renders images section when images are provided", () => {
    const event = createEvent({
      event_image_1x1: "https://blob.vercel-storage.com/img1.jpg",
      event_image_16x9: "https://blob.vercel-storage.com/img2.jpg",
    });
    render(<EventDetailView event={event} />);
    expect(screen.getByText("Images")).toBeInTheDocument();
    expect(screen.getByAltText("Image 1:1 preview")).toBeInTheDocument();
    expect(screen.getByAltText("Image 16:9 preview")).toBeInTheDocument();
  });

  it("does not render images section when no images", () => {
    const event = createEvent({ event_image_1x1: "", event_image_16x9: "" });
    render(<EventDetailView event={event} />);
    expect(screen.queryByText("Images")).not.toBeInTheDocument();
  });

  it("renders dash for empty date strings", () => {
    const event = createEvent({ event_start_date: "", event_end_date: "" });
    render(<EventDetailView event={event} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("renders dash for unknown price type", () => {
    const event = createEvent({ event_price_type: "unknown" as never });
    render(<EventDetailView event={event} />);
    // Price field should show dash
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("renders range price with missing values as question marks", () => {
    const event = createEvent({
      event_price_type: "range",
      event_low_price: null,
      event_high_price: null,
      event_price_currency: "CHF",
    });
    render(<EventDetailView event={event} />);
    expect(screen.getByText(/CHF \? – \?/)).toBeInTheDocument();
  });
});
