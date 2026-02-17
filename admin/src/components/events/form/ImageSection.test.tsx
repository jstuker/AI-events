import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageSection } from "./ImageSection";
import { createEvent } from "../../../test/fixtures";
import { eventToFormData } from "../../../types/event-form";

vi.mock("../../../services/image-upload-service", () => ({
  uploadEventImage: vi.fn(),
  previewUrl: vi.fn((path: string) => `https://preview.test${path}`),
}));

import { uploadEventImage } from "../../../services/image-upload-service";
const mockUpload = vi.mocked(uploadEventImage);

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    formData: eventToFormData(createEvent()),
    errors: {} as Record<string, string>,
    setField: vi.fn(),
    eventId: "test-event-id",
    token: "test-token",
    ...overrides,
  };
}

describe("ImageSection", () => {
  beforeEach(() => {
    mockUpload.mockReset();
  });

  it("renders both image fields with labels", () => {
    render(<ImageSection {...defaultProps()} />);
    expect(screen.getByText("Image 1:1 (Square)")).toBeInTheDocument();
    expect(screen.getByText("Image 16:9 (Widescreen)")).toBeInTheDocument();
  });

  it("renders file inputs for both fields", () => {
    render(<ImageSection {...defaultProps()} />);
    const fileInputs = document.querySelectorAll('input[type="file"]');
    expect(fileInputs).toHaveLength(2);
  });

  it("shows current path when image is set", () => {
    const formData = eventToFormData(
      createEvent({
        event_image_1x1: "/images/events/test/image-1x1.jpg",
      }),
    );
    render(<ImageSection {...defaultProps({ formData })} />);
    expect(
      screen.getByText("/images/events/test/image-1x1.jpg"),
    ).toBeInTheDocument();
  });

  it("shows preview thumbnail when image path exists", () => {
    const formData = eventToFormData(
      createEvent({
        event_image_1x1: "/images/events/test/image-1x1.jpg",
      }),
    );
    render(<ImageSection {...defaultProps({ formData })} />);
    const img = screen.getByAltText("Image 1:1 (Square) preview");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://preview.test/images/events/test/image-1x1.jpg",
    );
  });

  it("uploads file and calls setField with result path", async () => {
    const user = userEvent.setup();
    mockUpload.mockResolvedValue({
      path: "/images/events/test-event-id/image-1x1.jpg",
      sha: "abc",
    });
    const setField = vi.fn();
    render(<ImageSection {...defaultProps({ setField })} />);

    const fileInput = document.querySelector(
      "#event_image_1x1",
    ) as HTMLInputElement;
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    expect(mockUpload).toHaveBeenCalledWith(
      file,
      "test-token",
      "test-event-id",
      "1x1",
    );
    expect(setField).toHaveBeenCalledWith(
      "event_image_1x1",
      "/images/events/test-event-id/image-1x1.jpg",
    );
  });

  it("shows uploading status during upload", async () => {
    const user = userEvent.setup();
    let resolveUpload: (value: { path: string; sha: string }) => void;
    mockUpload.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        }),
    );

    render(<ImageSection {...defaultProps()} />);
    const fileInput = document.querySelector(
      "#event_image_1x1",
    ) as HTMLInputElement;
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    expect(screen.getByText("Uploading...")).toBeInTheDocument();

    resolveUpload!({ path: "/images/events/test/image-1x1.jpg", sha: "abc" });
  });

  it("shows error message when upload fails", async () => {
    const user = userEvent.setup();
    mockUpload.mockRejectedValue(new Error("Upload failed: 422"));

    render(<ImageSection {...defaultProps()} />);
    const fileInput = document.querySelector(
      "#event_image_1x1",
    ) as HTMLInputElement;
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    expect(await screen.findByText("Upload failed: 422")).toBeInTheDocument();
  });

  it("shows validation errors from props", () => {
    const errors = { event_image_1x1: "Invalid image path" };
    render(<ImageSection {...defaultProps({ errors })} />);
    expect(screen.getByText("Invalid image path")).toBeInTheDocument();
  });

  it("renders the Images legend", () => {
    render(<ImageSection {...defaultProps()} />);
    expect(screen.getByText("Images")).toBeInTheDocument();
  });
});
