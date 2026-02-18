import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildConfirmationEmail,
  buildNotificationEmail,
  getEmailConfig,
  isEmailEnabled,
  type SubmissionEmailData,
} from "./email-service.js";

// --- Test fixture ---

function sampleEmailData(): SubmissionEmailData {
  return {
    event_id: "abc-123-def",
    event_name: "Zurich AI Meetup 2026",
    event_start_date: "2026-09-17",
    event_end_date: "2026-09-17",
    event_url: "https://example.com/event",
    contact_name: "Max Muster",
    contact_email: "max@example.com",
    location_name: "ETH Zurich",
    organizer_name: "AI Zurich",
  };
}

// --- getEmailConfig ---

describe("getEmailConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when SMTP_HOST is missing", () => {
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_USER", "user@example.com");
    vi.stubEnv("SMTP_PASSWORD", "secret");
    expect(getEmailConfig()).toBeNull();
  });

  it("returns null when SMTP_USER is missing", () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASSWORD", "secret");
    expect(getEmailConfig()).toBeNull();
  });

  it("returns null when SMTP_PASSWORD is missing", () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_USER", "user@example.com");
    vi.stubEnv("SMTP_PASSWORD", "");
    expect(getEmailConfig()).toBeNull();
  });

  it("returns config with defaults when all required vars set", () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_USER", "user@example.com");
    vi.stubEnv("SMTP_PASSWORD", "secret");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_SECURE", "");
    vi.stubEnv("FROM_EMAIL", "");
    vi.stubEnv("FROM_NAME", "");
    vi.stubEnv("NOTIFICATION_EMAIL", "");

    const config = getEmailConfig();
    expect(config).not.toBeNull();
    expect(config!.host).toBe("smtp.example.com");
    expect(config!.port).toBe(587);
    expect(config!.secure).toBe(false);
    expect(config!.fromEmail).toBe("user@example.com");
    expect(config!.fromName).toBe("Swiss {ai} Weeks");
    expect(config!.notificationEmail).toBe("events@ai-weeks.ch");
  });

  it("respects custom port and secure settings", () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_USER", "user@example.com");
    vi.stubEnv("SMTP_PASSWORD", "secret");
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_SECURE", "true");
    vi.stubEnv("FROM_EMAIL", "noreply@ai-weeks.ch");
    vi.stubEnv("FROM_NAME", "AI Events");
    vi.stubEnv("NOTIFICATION_EMAIL", "team@ai-weeks.ch");

    const config = getEmailConfig();
    expect(config!.port).toBe(465);
    expect(config!.secure).toBe(true);
    expect(config!.fromEmail).toBe("noreply@ai-weeks.ch");
    expect(config!.fromName).toBe("AI Events");
    expect(config!.notificationEmail).toBe("team@ai-weeks.ch");
  });
});

// --- isEmailEnabled ---

describe("isEmailEnabled", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("ENABLE_EMAILS", "");
    expect(isEmailEnabled()).toBe(true);
  });

  it("returns false in preview", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("ENABLE_EMAILS", "");
    expect(isEmailEnabled()).toBe(false);
  });

  it("returns false in development", () => {
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("ENABLE_EMAILS", "");
    expect(isEmailEnabled()).toBe(false);
  });

  it("returns true when ENABLE_EMAILS override is set", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("ENABLE_EMAILS", "true");
    expect(isEmailEnabled()).toBe(true);
  });
});

// --- buildConfirmationEmail ---

describe("buildConfirmationEmail", () => {
  it("includes event name in subject", () => {
    const data = sampleEmailData();
    const email = buildConfirmationEmail(data);
    expect(email.subject).toBe("Event submission received: Zurich AI Meetup 2026");
  });

  it("includes contact name in HTML body", () => {
    const data = sampleEmailData();
    const email = buildConfirmationEmail(data);
    expect(email.html).toContain("Max Muster");
  });

  it("includes event details in HTML body", () => {
    const data = sampleEmailData();
    const email = buildConfirmationEmail(data);
    expect(email.html).toContain("Zurich AI Meetup 2026");
    expect(email.html).toContain("2026-09-17");
    expect(email.html).toContain("ETH Zurich");
    expect(email.html).toContain("abc-123-def");
  });

  it("includes event details in text body", () => {
    const data = sampleEmailData();
    const email = buildConfirmationEmail(data);
    expect(email.text).toContain("Zurich AI Meetup 2026");
    expect(email.text).toContain("ETH Zurich");
    expect(email.text).toContain("abc-123-def");
  });

  it("escapes HTML in event name", () => {
    const data: SubmissionEmailData = {
      ...sampleEmailData(),
      event_name: '<script>alert("xss")</script>',
    };
    const email = buildConfirmationEmail(data);
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("includes ai-weeks.ch link", () => {
    const email = buildConfirmationEmail(sampleEmailData());
    expect(email.html).toContain("ai-weeks.ch");
    expect(email.text).toContain("ai-weeks.ch");
  });
});

// --- buildNotificationEmail ---

describe("buildNotificationEmail", () => {
  it("includes event name in subject", () => {
    const data = sampleEmailData();
    const email = buildNotificationEmail(data);
    expect(email.subject).toBe("New event submission: Zurich AI Meetup 2026");
  });

  it("includes contact details for team review", () => {
    const data = sampleEmailData();
    const email = buildNotificationEmail(data);
    expect(email.html).toContain("Max Muster");
    expect(email.html).toContain("max@example.com");
  });

  it("includes organizer name", () => {
    const data = sampleEmailData();
    const email = buildNotificationEmail(data);
    expect(email.html).toContain("AI Zurich");
  });

  it("shows fallback when organizer is empty", () => {
    const data: SubmissionEmailData = {
      ...sampleEmailData(),
      organizer_name: "",
    };
    const email = buildNotificationEmail(data);
    expect(email.html).toContain("Not provided");
    expect(email.text).toContain("Not provided");
  });

  it("includes event URL as link", () => {
    const data = sampleEmailData();
    const email = buildNotificationEmail(data);
    expect(email.html).toContain("https://example.com/event");
  });

  it("includes admin panel link", () => {
    const data = sampleEmailData();
    const email = buildNotificationEmail(data);
    expect(email.html).toContain("https://ai-weeks.ch/admin/");
    expect(email.text).toContain("https://ai-weeks.ch/admin/");
  });

  it("includes submission ID", () => {
    const data = sampleEmailData();
    const email = buildNotificationEmail(data);
    expect(email.html).toContain("abc-123-def");
    expect(email.text).toContain("abc-123-def");
  });

  it("escapes HTML in all user-provided fields", () => {
    const data: SubmissionEmailData = {
      ...sampleEmailData(),
      contact_name: 'Bob <img src=x onerror=alert(1)>',
      location_name: "Hall & Oates <venue>",
    };
    const email = buildNotificationEmail(data);
    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("&lt;img");
    expect(email.html).toContain("Hall &amp; Oates");
  });
});
