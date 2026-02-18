// Pure utility functions for event submission processing.
// Extracted for testability — no side effects, no I/O.

export interface SubmissionData {
  readonly contact_name: string;
  readonly contact_email: string;
  readonly contact_phone: string;
  readonly event_name: string;
  readonly event_description: string;
  readonly event_url: string;
  readonly event_start_date: string;
  readonly event_start_time: string;
  readonly event_end_date: string;
  readonly event_end_time: string;
  readonly event_attendance_mode: string;
  readonly event_language: readonly string[];
  readonly event_target_audience: string;
  readonly event_price_type: string;
  readonly event_price: number | null;
  readonly event_low_price: number | null;
  readonly event_high_price: number | null;
  readonly event_price_currency: string;
  readonly event_image_1x1: string;
  readonly event_image_16x9: string;
  readonly location_name: string;
  readonly location_address: string;
  readonly organizer_name: string;
  readonly organizer_url: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const VALID_ATTENDANCE_MODES = ["presence", "online", "hybrid"];
const VALID_PRICE_TYPES = ["free", "paid", "range"];
const VALID_LANGUAGES = ["de", "fr", "it", "en"];
const VALID_CURRENCIES = ["CHF", "EUR", "USD"];

export function validateSubmission(
  body: unknown,
): { data: SubmissionData } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;

  const requiredFields = [
    ["contact_name", "Contact Name"],
    ["contact_email", "Email"],
    ["event_name", "Event Name"],
    ["event_description", "Event Description"],
    ["event_url", "Event URL"],
    ["event_start_date", "Start Date"],
    ["event_end_date", "End Date"],
    ["location_name", "Location Name"],
    ["location_address", "Location Address"],
  ] as const;

  for (const [field, label] of requiredFields) {
    const value = b[field];
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      return { error: `${label} is required.` };
    }
  }

  const contactName = String(b.contact_name).trim();
  const contactEmail = String(b.contact_email).trim();
  const contactPhone = b.contact_phone ? String(b.contact_phone).trim() : "";
  const eventName = String(b.event_name).trim();
  const eventDescription = String(b.event_description).trim();
  const eventUrl = String(b.event_url).trim();
  const eventStartDate = String(b.event_start_date).trim();
  const eventStartTime = b.event_start_time
    ? String(b.event_start_time).trim()
    : "";
  const eventEndDate = String(b.event_end_date).trim();
  const eventEndTime = b.event_end_time ? String(b.event_end_time).trim() : "";

  if (!EMAIL_PATTERN.test(contactEmail)) {
    return { error: "Please enter a valid email address." };
  }

  try {
    new URL(eventUrl);
  } catch {
    return { error: "Please enter a valid Event URL." };
  }

  if (!DATE_PATTERN.test(eventStartDate)) {
    return { error: "Start Date must be in YYYY-MM-DD format." };
  }
  if (!DATE_PATTERN.test(eventEndDate)) {
    return { error: "End Date must be in YYYY-MM-DD format." };
  }
  if (eventEndDate < eventStartDate) {
    return { error: "End Date must be on or after Start Date." };
  }

  if (eventStartTime && !TIME_PATTERN.test(eventStartTime)) {
    return { error: "Start Time must be in HH:MM format." };
  }
  if (eventEndTime && !TIME_PATTERN.test(eventEndTime)) {
    return { error: "End Time must be in HH:MM format." };
  }

  const attendanceMode = b.event_attendance_mode
    ? String(b.event_attendance_mode).trim()
    : "presence";
  if (!VALID_ATTENDANCE_MODES.includes(attendanceMode)) {
    return { error: "Invalid attendance mode." };
  }

  const languages = Array.isArray(b.event_language)
    ? (b.event_language as string[]).filter((l) => VALID_LANGUAGES.includes(l))
    : [];

  const priceType = b.event_price_type
    ? String(b.event_price_type).trim()
    : "free";
  if (!VALID_PRICE_TYPES.includes(priceType)) {
    return { error: "Invalid price type." };
  }

  const currency =
    b.event_price_currency &&
    VALID_CURRENCIES.includes(String(b.event_price_currency))
      ? String(b.event_price_currency)
      : "CHF";

  const price =
    priceType === "paid" && typeof b.event_price === "number"
      ? b.event_price
      : null;
  const lowPrice =
    priceType === "range" && typeof b.event_low_price === "number"
      ? b.event_low_price
      : null;
  const highPrice =
    priceType === "range" && typeof b.event_high_price === "number"
      ? b.event_high_price
      : null;

  const organizerUrl = b.organizer_url ? String(b.organizer_url).trim() : "";
  if (organizerUrl) {
    try {
      new URL(organizerUrl);
    } catch {
      return { error: "Please enter a valid Organizer URL." };
    }
  }

  const sanitize = (str: string): string => str.replace(/<[^>]*>/g, "").trim();

  return {
    data: {
      contact_name: sanitize(contactName).slice(0, 200),
      contact_email: contactEmail.slice(0, 200),
      contact_phone: sanitize(contactPhone).slice(0, 50),
      event_name: sanitize(eventName).slice(0, 300),
      event_description: sanitize(eventDescription).slice(0, 5000),
      event_url: eventUrl.slice(0, 500),
      event_start_date: eventStartDate,
      event_start_time: eventStartTime,
      event_end_date: eventEndDate,
      event_end_time: eventEndTime,
      event_attendance_mode: attendanceMode,
      event_language: languages,
      event_target_audience: sanitize(
        b.event_target_audience ? String(b.event_target_audience) : "",
      ).slice(0, 300),
      event_price_type: priceType,
      event_price: price,
      event_low_price: lowPrice,
      event_high_price: highPrice,
      event_price_currency: currency,
      event_image_1x1: b.event_image_1x1
        ? String(b.event_image_1x1).trim().slice(0, 1000)
        : "",
      event_image_16x9: b.event_image_16x9
        ? String(b.event_image_16x9).trim().slice(0, 1000)
        : "",
      location_name: sanitize(String(b.location_name)).slice(0, 300),
      location_address: sanitize(String(b.location_address)).slice(0, 500),
      organizer_name: sanitize(
        b.organizer_name ? String(b.organizer_name) : "",
      ).slice(0, 300),
      organizer_url: organizerUrl.slice(0, 500),
    },
  };
}

export function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function generateUUID(): string {
  const hex = "0123456789abcdef";
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map((len) => {
      let s = "";
      for (let i = 0; i < len; i++) {
        s += hex[Math.floor(Math.random() * 16)];
      }
      return s;
    })
    .join("-");
}

export function yamlString(value: string): string {
  if (!value) return '""';
  if (/[:#{}[\],&*?|>!%@`'"\n]/.test(value) || value.startsWith(" ")) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function buildContentFile(data: SubmissionData, eventId: string): string {
  const now = new Date().toISOString();
  const slug = toSlug(data.event_name);

  const startDateTime = data.event_start_time
    ? `${data.event_start_date}T${data.event_start_time}:00+01:00`
    : `${data.event_start_date}T00:00:00+01:00`;
  const endDateTime = data.event_end_time
    ? `${data.event_end_date}T${data.event_end_time}:00+01:00`
    : `${data.event_end_date}T23:59:00+01:00`;

  const lines: string[] = [
    "---",
    `event_id: ${eventId}`,
    `date: ${startDateTime}`,
    `slug: ${slug}`,
    `status: draft`,
    `source: submission_form`,
    `created_at: ${now}`,
    `updated_at: ${now}`,
    `event_name: ${yamlString(data.event_name)}`,
    `event_description: ${yamlString(data.event_description)}`,
    `event_url: ${data.event_url}`,
    `event_start_date: ${startDateTime}`,
    `event_end_date: ${endDateTime}`,
    `event_attendance_mode: ${data.event_attendance_mode}`,
    `event_target_audience: ${yamlString(data.event_target_audience)}`,
  ];

  if (data.event_language.length > 0) {
    lines.push("event_language:");
    for (const lang of data.event_language) {
      lines.push(`  - ${lang}`);
    }
  } else {
    lines.push("event_language: []");
  }

  lines.push(`event_price_type: ${data.event_price_type}`);
  lines.push(`event_price_currency: ${data.event_price_currency}`);
  if (data.event_price !== null) {
    lines.push(`event_price: ${data.event_price}`);
  }
  if (data.event_low_price !== null) {
    lines.push(`event_low_price: ${data.event_low_price}`);
  }
  if (data.event_high_price !== null) {
    lines.push(`event_high_price: ${data.event_high_price}`);
  }
  lines.push(`event_price_availability: InStock`);

  lines.push(`event_image_1x1: ${yamlString(data.event_image_1x1)}`);
  lines.push(`event_image_16x9: ${yamlString(data.event_image_16x9)}`);

  lines.push(`location_name: ${yamlString(data.location_name)}`);
  lines.push(`location_address: ${yamlString(data.location_address)}`);

  lines.push(`organizer_name: ${yamlString(data.organizer_name)}`);
  lines.push(`organizer_url: ${data.organizer_url || '""'}`);

  lines.push(`contact_name: ${yamlString(data.contact_name)}`);
  lines.push(`contact_email: ${data.contact_email}`);
  lines.push(`contact_phone: ${yamlString(data.contact_phone)}`);

  lines.push(`featured: false`);
  lines.push(`featured_type: ""`);
  lines.push(`tags: []`);
  lines.push(`publication_channels: []`);
  lines.push("locations:");
  lines.push(`  - ${yamlString(data.location_name)}`);
  lines.push("cities: []");
  lines.push("organizers:");
  if (data.organizer_name) {
    lines.push(`  - ${yamlString(data.organizer_name)}`);
  }

  lines.push("---");
  lines.push(data.event_description);
  lines.push("");

  return lines.join("\n");
}

export function isBlobUrl(url: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url);
}

export function extensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
  };
  return map[contentType] || "jpg";
}
