import { describe, it, expect } from "vitest";
import {
  validateSubmission,
  toSlug,
  generateUUID,
  yamlString,
  buildContentFile,
  isBlobUrl,
  extensionFromContentType,
  type SubmissionData,
} from "./submission-utils.js";

// --- Test fixtures ---

function validBody(): Record<string, unknown> {
  return {
    contact_name: "Max Muster",
    contact_email: "max@example.com",
    contact_phone: "+41 79 123 45 67",
    event_name: "Zurich AI Meetup 2026",
    event_description: "A great AI event in Zurich.",
    event_url: "https://example.com/event",
    event_start_date: "2026-09-17",
    event_start_time: "18:00",
    event_end_date: "2026-09-17",
    event_end_time: "21:00",
    event_attendance_mode: "presence",
    event_language: ["en", "de"],
    event_target_audience: "AI enthusiasts",
    event_price_type: "free",
    event_price: null,
    event_low_price: null,
    event_high_price: null,
    event_price_currency: "CHF",
    event_image_1x1: "",
    event_image_16x9: "",
    location_name: "ETH Zurich",
    location_address: "Rämistrasse 101, 8006 Zürich",
    organizer_name: "AI Zurich",
    organizer_url: "https://aizurich.com",
  };
}

function validSubmissionData(): SubmissionData {
  return {
    contact_name: "Max Muster",
    contact_email: "max@example.com",
    contact_phone: "+41 79 123 45 67",
    event_name: "Zurich AI Meetup 2026",
    event_description: "A great AI event in Zurich.",
    event_url: "https://example.com/event",
    event_start_date: "2026-09-17",
    event_start_time: "18:00",
    event_end_date: "2026-09-17",
    event_end_time: "21:00",
    event_attendance_mode: "presence",
    event_language: ["en", "de"],
    event_target_audience: "AI enthusiasts",
    event_price_type: "free",
    event_price: null,
    event_low_price: null,
    event_high_price: null,
    event_price_currency: "CHF",
    event_image_1x1: "",
    event_image_16x9: "",
    location_name: "ETH Zurich",
    location_address: "Rämistrasse 101, 8006 Zürich",
    organizer_name: "AI Zurich",
    organizer_url: "https://aizurich.com",
  };
}

// --- validateSubmission ---

describe("validateSubmission", () => {
  it("accepts a valid complete submission", () => {
    const result = validateSubmission(validBody());
    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.event_name).toBe("Zurich AI Meetup 2026");
      expect(result.data.contact_email).toBe("max@example.com");
    }
  });

  it("rejects null body", () => {
    const result = validateSubmission(null);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toBe("Invalid request body");
    }
  });

  it("rejects non-object body", () => {
    const result = validateSubmission("string");
    expect("error" in result).toBe(true);
  });

  describe("required fields", () => {
    const requiredFields: Array<[string, string]> = [
      ["contact_name", "Contact Name"],
      ["contact_email", "Email"],
      ["event_name", "Event Name"],
      ["event_description", "Event Description"],
      ["event_url", "Event URL"],
      ["event_start_date", "Start Date"],
      ["event_end_date", "End Date"],
      ["location_name", "Location Name"],
      ["location_address", "Location Address"],
    ];

    for (const [field, label] of requiredFields) {
      it(`rejects missing ${field}`, () => {
        const body = validBody();
        delete body[field];
        const result = validateSubmission(body);
        expect("error" in result).toBe(true);
        if ("error" in result) {
          expect(result.error).toBe(`${label} is required.`);
        }
      });

      it(`rejects empty ${field}`, () => {
        const body = validBody();
        body[field] = "   ";
        const result = validateSubmission(body);
        expect("error" in result).toBe(true);
      });
    }
  });

  describe("email validation", () => {
    it("rejects invalid email", () => {
      const body = validBody();
      body.contact_email = "not-an-email";
      const result = validateSubmission(body);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Please enter a valid email address.");
      }
    });

    it("accepts valid email", () => {
      const body = validBody();
      body.contact_email = "user@domain.co.uk";
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
    });
  });

  describe("URL validation", () => {
    it("rejects invalid event URL", () => {
      const body = validBody();
      body.event_url = "not-a-url";
      const result = validateSubmission(body);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Please enter a valid Event URL.");
      }
    });

    it("rejects invalid organizer URL", () => {
      const body = validBody();
      body.organizer_url = "bad-url";
      const result = validateSubmission(body);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Please enter a valid Organizer URL.");
      }
    });

    it("accepts empty organizer URL", () => {
      const body = validBody();
      body.organizer_url = "";
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
    });
  });

  describe("date validation", () => {
    it("rejects invalid start date format", () => {
      const body = validBody();
      body.event_start_date = "17-09-2026";
      const result = validateSubmission(body);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Start Date must be in YYYY-MM-DD format.");
      }
    });

    it("rejects end date before start date", () => {
      const body = validBody();
      body.event_start_date = "2026-09-17";
      body.event_end_date = "2026-09-16";
      const result = validateSubmission(body);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("End Date must be on or after Start Date.");
      }
    });

    it("accepts same start and end date", () => {
      const body = validBody();
      body.event_start_date = "2026-09-17";
      body.event_end_date = "2026-09-17";
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
    });
  });

  describe("time validation", () => {
    it("rejects invalid start time format", () => {
      const body = validBody();
      body.event_start_time = "6pm";
      const result = validateSubmission(body);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Start Time must be in HH:MM format.");
      }
    });

    it("accepts empty times", () => {
      const body = validBody();
      body.event_start_time = "";
      body.event_end_time = "";
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
    });
  });

  describe("attendance mode", () => {
    it("rejects invalid attendance mode", () => {
      const body = validBody();
      body.event_attendance_mode = "virtual";
      const result = validateSubmission(body);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Invalid attendance mode.");
      }
    });

    it("defaults to presence when not provided", () => {
      const body = validBody();
      delete body.event_attendance_mode;
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.event_attendance_mode).toBe("presence");
      }
    });
  });

  describe("languages", () => {
    it("filters out invalid languages", () => {
      const body = validBody();
      body.event_language = ["en", "xx", "de", "zz"];
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.event_language).toEqual(["en", "de"]);
      }
    });

    it("defaults to empty array when not provided", () => {
      const body = validBody();
      delete body.event_language;
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.event_language).toEqual([]);
      }
    });
  });

  describe("pricing", () => {
    it("rejects invalid price type", () => {
      const body = validBody();
      body.event_price_type = "donation";
      const result = validateSubmission(body);
      expect("error" in result).toBe(true);
    });

    it("captures price for paid type", () => {
      const body = validBody();
      body.event_price_type = "paid";
      body.event_price = 150;
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.event_price).toBe(150);
        expect(result.data.event_low_price).toBeNull();
      }
    });

    it("captures range prices for range type", () => {
      const body = validBody();
      body.event_price_type = "range";
      body.event_low_price = 50;
      body.event_high_price = 200;
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.event_low_price).toBe(50);
        expect(result.data.event_high_price).toBe(200);
        expect(result.data.event_price).toBeNull();
      }
    });

    it("defaults currency to CHF for unknown currency", () => {
      const body = validBody();
      body.event_price_currency = "GBP";
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.event_price_currency).toBe("CHF");
      }
    });
  });

  describe("sanitization", () => {
    it("strips HTML tags from text fields", () => {
      const body = validBody();
      body.event_name = "AI <script>alert('xss')</script>Meetup";
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.event_name).toBe("AI alert('xss')Meetup");
      }
    });

    it("enforces field length limits", () => {
      const body = validBody();
      body.event_name = "A".repeat(500);
      const result = validateSubmission(body);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.event_name.length).toBe(300);
      }
    });
  });
});

// --- toSlug ---

describe("toSlug", () => {
  it("converts a simple name to slug", () => {
    expect(toSlug("Zurich AI Meetup")).toBe("zurich-ai-meetup");
  });

  it("strips diacritics", () => {
    expect(toSlug("Zürich Café")).toBe("zurich-cafe");
  });

  it("handles special characters", () => {
    expect(toSlug("AI & ML: Workshop!")).toBe("ai-ml-workshop");
  });

  it("strips leading and trailing hyphens", () => {
    expect(toSlug("--hello world--")).toBe("hello-world");
  });

  it("truncates to 80 characters", () => {
    const longName = "a".repeat(100);
    expect(toSlug(longName).length).toBe(80);
  });

  it("handles empty string", () => {
    expect(toSlug("")).toBe("");
  });
});

// --- generateUUID ---

describe("generateUUID", () => {
  it("generates a string in UUID format (8-4-4-4-12)", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("generates unique values", () => {
    const uuids = new Set(Array.from({ length: 50 }, () => generateUUID()));
    expect(uuids.size).toBe(50);
  });
});

// --- yamlString ---

describe("yamlString", () => {
  it("returns empty quotes for empty string", () => {
    expect(yamlString("")).toBe('""');
  });

  it("returns plain string when safe", () => {
    expect(yamlString("simple text")).toBe("simple text");
  });

  it("wraps string with colons in quotes", () => {
    expect(yamlString("key: value")).toBe('"key: value"');
  });

  it("wraps string with hash in quotes", () => {
    expect(yamlString("text #comment")).toBe('"text #comment"');
  });

  it("escapes embedded quotes", () => {
    expect(yamlString('say "hello"')).toBe('"say \\"hello\\""');
  });

  it("wraps string starting with space", () => {
    expect(yamlString(" leading space")).toBe('" leading space"');
  });

  it("passes through backslashes when no special YAML chars present", () => {
    expect(yamlString("path\\to\\file")).toBe("path\\to\\file");
  });
});

// --- buildContentFile ---

describe("buildContentFile", () => {
  it("generates valid YAML frontmatter with correct fields", () => {
    const data = validSubmissionData();
    const content = buildContentFile(data, "test-uuid-1234");

    expect(content).toContain("---");
    expect(content).toContain("event_id: test-uuid-1234");
    expect(content).toContain("slug: zurich-ai-meetup-2026");
    expect(content).toContain("status: draft");
    expect(content).toContain("source: submission_form");
    expect(content).toContain("event_name: Zurich AI Meetup 2026");
    expect(content).toContain("event_attendance_mode: presence");
    expect(content).toContain("event_price_type: free");
    expect(content).toContain("event_price_currency: CHF");
    expect(content).toContain("event_price_availability: InStock");
    expect(content).toContain("location_name: ETH Zurich");
    expect(content).toContain("contact_email: max@example.com");
    expect(content).toContain("featured: false");
  });

  it("formats start date with time when time is provided", () => {
    const data = validSubmissionData();
    const content = buildContentFile(data, "test-uuid");

    expect(content).toContain("date: 2026-09-17T18:00:00+01:00");
    expect(content).toContain("event_start_date: 2026-09-17T18:00:00+01:00");
    expect(content).toContain("event_end_date: 2026-09-17T21:00:00+01:00");
  });

  it("defaults to midnight/end-of-day when time is empty", () => {
    const data: SubmissionData = {
      ...validSubmissionData(),
      event_start_time: "",
      event_end_time: "",
    };
    const content = buildContentFile(data, "test-uuid");

    expect(content).toContain("date: 2026-09-17T00:00:00+01:00");
    expect(content).toContain("event_end_date: 2026-09-17T23:59:00+01:00");
  });

  it("includes languages as YAML list", () => {
    const data = validSubmissionData();
    const content = buildContentFile(data, "test-uuid");

    expect(content).toContain("event_language:");
    expect(content).toContain("  - en");
    expect(content).toContain("  - de");
  });

  it("renders empty language array", () => {
    const data: SubmissionData = {
      ...validSubmissionData(),
      event_language: [],
    };
    const content = buildContentFile(data, "test-uuid");

    expect(content).toContain("event_language: []");
  });

  it("includes paid price fields", () => {
    const data: SubmissionData = {
      ...validSubmissionData(),
      event_price_type: "paid",
      event_price: 150,
    };
    const content = buildContentFile(data, "test-uuid");

    expect(content).toContain("event_price_type: paid");
    expect(content).toContain("event_price: 150");
  });

  it("includes range price fields", () => {
    const data: SubmissionData = {
      ...validSubmissionData(),
      event_price_type: "range",
      event_low_price: 50,
      event_high_price: 200,
    };
    const content = buildContentFile(data, "test-uuid");

    expect(content).toContain("event_low_price: 50");
    expect(content).toContain("event_high_price: 200");
  });

  it("includes organizer in organizers taxonomy", () => {
    const data = validSubmissionData();
    const content = buildContentFile(data, "test-uuid");

    expect(content).toContain("organizers:");
    expect(content).toContain("  - AI Zurich");
  });

  it("omits organizer from taxonomy when empty", () => {
    const data: SubmissionData = {
      ...validSubmissionData(),
      organizer_name: "",
    };
    const content = buildContentFile(data, "test-uuid");

    const lines = content.split("\n");
    const organizersIdx = lines.findIndex((l) => l === "organizers:");
    // Next line after "organizers:" should be "---" (closing frontmatter)
    expect(lines[organizersIdx + 1]).toBe("---");
  });

  it("includes event description as markdown body", () => {
    const data = validSubmissionData();
    const content = buildContentFile(data, "test-uuid");

    // Body comes after second "---"
    const parts = content.split("---");
    expect(parts.length).toBe(3);
    expect(parts[2].trim()).toBe("A great AI event in Zurich.");
  });
});

// --- isBlobUrl ---

describe("isBlobUrl", () => {
  it("matches valid Vercel Blob URLs", () => {
    expect(
      isBlobUrl("https://abc123.public.blob.vercel-storage.com/image.jpg"),
    ).toBe(true);
  });

  it("rejects non-blob URLs", () => {
    expect(isBlobUrl("https://example.com/image.jpg")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isBlobUrl("")).toBe(false);
  });
});

// --- extensionFromContentType ---

describe("extensionFromContentType", () => {
  it("returns jpg for image/jpeg", () => {
    expect(extensionFromContentType("image/jpeg")).toBe("jpg");
  });

  it("returns png for image/png", () => {
    expect(extensionFromContentType("image/png")).toBe("png");
  });

  it("returns gif for image/gif", () => {
    expect(extensionFromContentType("image/gif")).toBe("gif");
  });

  it("defaults to jpg for unknown type", () => {
    expect(extensionFromContentType("image/webp")).toBe("jpg");
  });
});
