import type { VercelRequest, VercelResponse } from "@vercel/node";

// --- Rate limiting ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  const updated = { count: entry.count + 1, resetAt: entry.resetAt };
  rateLimitMap.set(ip, updated);
  return updated.count > RATE_LIMIT_MAX;
}

// --- CORS helpers ---
function getAllowedOrigins(): readonly string[] {
  const origins: string[] = ["https://ai-weeks.ch"];
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl) origins.push(`https://${vercelUrl}`);
  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL;
  if (vercelBranchUrl) origins.push(`https://${vercelBranchUrl}`);
  const vercelDeployUrl = process.env.VERCEL_URL;
  if (vercelDeployUrl) origins.push(`https://${vercelDeployUrl}`);
  return origins;
}

// --- Validation ---
interface SubmissionData {
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
  readonly event_image_url: string;
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

function validateSubmission(
  body: unknown
): { data: SubmissionData } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;

  // Required string fields
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
  const eventEndTime = b.event_end_time
    ? String(b.event_end_time).trim()
    : "";

  // Validate email
  if (!EMAIL_PATTERN.test(contactEmail)) {
    return { error: "Please enter a valid email address." };
  }

  // Validate URL
  try {
    new URL(eventUrl);
  } catch {
    return { error: "Please enter a valid Event URL." };
  }

  // Validate dates
  if (!DATE_PATTERN.test(eventStartDate)) {
    return { error: "Start Date must be in YYYY-MM-DD format." };
  }
  if (!DATE_PATTERN.test(eventEndDate)) {
    return { error: "End Date must be in YYYY-MM-DD format." };
  }
  if (eventEndDate < eventStartDate) {
    return { error: "End Date must be on or after Start Date." };
  }

  // Validate optional times
  if (eventStartTime && !TIME_PATTERN.test(eventStartTime)) {
    return { error: "Start Time must be in HH:MM format." };
  }
  if (eventEndTime && !TIME_PATTERN.test(eventEndTime)) {
    return { error: "End Time must be in HH:MM format." };
  }

  // Validate attendance mode
  const attendanceMode = b.event_attendance_mode
    ? String(b.event_attendance_mode).trim()
    : "presence";
  if (!VALID_ATTENDANCE_MODES.includes(attendanceMode)) {
    return { error: "Invalid attendance mode." };
  }

  // Validate languages
  const languages = Array.isArray(b.event_language)
    ? (b.event_language as string[]).filter((l) => VALID_LANGUAGES.includes(l))
    : [];

  // Validate price type
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

  // Validate optional organizer URL
  const organizerUrl = b.organizer_url
    ? String(b.organizer_url).trim()
    : "";
  if (organizerUrl) {
    try {
      new URL(organizerUrl);
    } catch {
      return { error: "Please enter a valid Organizer URL." };
    }
  }

  // Sanitize text fields (strip HTML tags)
  const sanitize = (str: string): string =>
    str.replace(/<[^>]*>/g, "").trim();

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
        b.event_target_audience ? String(b.event_target_audience) : ""
      ).slice(0, 300),
      event_price_type: priceType,
      event_price: price,
      event_low_price: lowPrice,
      event_high_price: highPrice,
      event_price_currency: currency,
      event_image_url: b.event_image_url
        ? String(b.event_image_url).trim().slice(0, 500)
        : "",
      location_name: sanitize(String(b.location_name)).slice(0, 300),
      location_address: sanitize(String(b.location_address)).slice(0, 500),
      organizer_name: sanitize(
        b.organizer_name ? String(b.organizer_name) : ""
      ).slice(0, 300),
      organizer_url: organizerUrl.slice(0, 500),
    },
  };
}

// --- Slug generation ---
function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// --- UUID v4 generation ---
function generateUUID(): string {
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

// --- Build markdown content file ---
function buildContentFile(data: SubmissionData, eventId: string): string {
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

  // Language
  if (data.event_language.length > 0) {
    lines.push("event_language:");
    for (const lang of data.event_language) {
      lines.push(`  - ${lang}`);
    }
  } else {
    lines.push("event_language: []");
  }

  // Pricing
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

  // Images
  if (data.event_image_url) {
    lines.push(`event_image_1x1: ${data.event_image_url}`);
    lines.push(`event_image_16x9: ${data.event_image_url}`);
  } else {
    lines.push(`event_image_1x1: ""`);
    lines.push(`event_image_16x9: ""`);
  }

  // Location
  lines.push(`location_name: ${yamlString(data.location_name)}`);
  lines.push(`location_address: ${yamlString(data.location_address)}`);

  // Organizer
  lines.push(`organizer_name: ${yamlString(data.organizer_name)}`);
  lines.push(`organizer_url: ${data.organizer_url || '""'}`);

  // Contact
  lines.push(`contact_name: ${yamlString(data.contact_name)}`);
  lines.push(`contact_email: ${data.contact_email}`);
  lines.push(`contact_phone: ${yamlString(data.contact_phone)}`);

  // Defaults for admin-managed fields
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

/** Wrap a string in quotes if it contains special YAML characters. */
function yamlString(value: string): string {
  if (!value) return '""';
  if (/[:#{}[\],&*?|>!%@`'"\n]/.test(value) || value.startsWith(" ")) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

// --- GitHub API ---
async function createFileViaGitHub(
  filePath: string,
  content: string
): Promise<void> {
  const token = process.env.GITHUB_SUBMISSION_TOKEN;
  const repo = process.env.GITHUB_REPO || "jstuker/AI-events";

  if (!token) {
    throw new Error("GITHUB_SUBMISSION_TOKEN not configured");
  }

  const encodedContent = Buffer.from(content).toString("base64");

  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `feat: new event submission via form`,
        content: encodedContent,
        branch: "main",
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `GitHub API error: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(`GitHub API returned ${response.status}`);
  }
}

// --- Handler ---
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  if (origin && allowedOrigins.some((allowed) => origin === allowed)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Rate limiting
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    "unknown";
  if (isRateLimited(ip)) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({
      error: "Too many submissions. Please try again in a minute.",
    });
    return;
  }

  // Validate
  const result = validateSubmission(req.body);
  if ("error" in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  const { data } = result;
  const eventId = generateUUID();
  const dateParts = data.event_start_date.split("-");
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  const filePath = `content/events/${year}/${month}/${day}/${eventId}.md`;
  const content = buildContentFile(data, eventId);

  try {
    await createFileViaGitHub(filePath, content);
    res.status(201).json({
      success: true,
      event_id: eventId,
      message: "Event submitted successfully. It will be reviewed shortly.",
    });
  } catch (error) {
    console.error("Submission failed:", error);
    res.status(500).json({
      error: "Failed to submit event. Please try again later.",
    });
  }
}
