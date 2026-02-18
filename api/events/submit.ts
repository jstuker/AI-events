import type { VercelRequest, VercelResponse } from "@vercel/node";
import { del } from "@vercel/blob";
import {
  type SubmissionData,
  validateSubmission,
  generateUUID,
  buildContentFile,
  isBlobUrl,
  extensionFromContentType,
} from "./submission-utils.js";
import { sendSubmissionEmails } from "./email-service.js";

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

// --- Blob image helpers ---
const FETCH_TIMEOUT_MS = 15_000;

async function transferImageToGitHub(
  blobUrl: string,
  eventId: string,
  imageLabel: string,
): Promise<string> {
  const response = await fetch(blobUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch blob image: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const ext = extensionFromContentType(contentType);
  const filePath = `static/images/events/${eventId}/${imageLabel}.${ext}`;
  const buffer = Buffer.from(await response.arrayBuffer());

  await createFileViaGitHub(filePath, buffer);
  return `/images/events/${eventId}/${imageLabel}.${ext}`;
}

async function deleteBlobFile(blobUrl: string): Promise<void> {
  try {
    await del(blobUrl);
  } catch (error) {
    console.error("Failed to delete blob (non-blocking):", blobUrl, error);
  }
}

// --- GitHub API ---
async function createFileViaGitHub(
  filePath: string,
  content: string | Buffer,
): Promise<void> {
  const token = process.env.GITHUB_SUBMISSION_TOKEN;
  const repo = process.env.GITHUB_REPO || "jstuker/AI-events";

  if (!token) {
    throw new Error("GITHUB_SUBMISSION_TOKEN not configured");
  }

  const encodedContent =
    typeof content === "string"
      ? Buffer.from(content).toString("base64")
      : content.toString("base64");

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
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `GitHub API error: ${response.status} ${response.statusText}`,
      errorBody,
    );
    throw new Error(`GitHub API returned ${response.status}`);
  }
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    // Transfer blob images to GitHub and get local paths
    let localImage1x1 = "";
    let localImage16x9 = "";
    const blobUrlsToClean: string[] = [];

    if (data.event_image_1x1 && isBlobUrl(data.event_image_1x1)) {
      localImage1x1 = await transferImageToGitHub(
        data.event_image_1x1,
        eventId,
        "image-1x1",
      );
      blobUrlsToClean.push(data.event_image_1x1);
    }

    if (data.event_image_16x9 && isBlobUrl(data.event_image_16x9)) {
      localImage16x9 = await transferImageToGitHub(
        data.event_image_16x9,
        eventId,
        "image-16x9",
      );
      blobUrlsToClean.push(data.event_image_16x9);
    }

    // Build content with local image paths
    const dataWithLocalImages: SubmissionData = {
      ...data,
      event_image_1x1: localImage1x1,
      event_image_16x9: localImage16x9,
    };
    const content = buildContentFile(dataWithLocalImages, eventId);

    await createFileViaGitHub(filePath, content);

    // Best-effort blob cleanup (awaited so it runs before function freezes)
    await Promise.allSettled(blobUrlsToClean.map(deleteBlobFile));

    // Send confirmation and notification emails (non-blocking)
    const emailResult = await sendSubmissionEmails({
      event_id: eventId,
      event_name: data.event_name,
      event_start_date: data.event_start_date,
      event_start_time: data.event_start_time,
      event_end_date: data.event_end_date,
      event_end_time: data.event_end_time,
      event_url: data.event_url,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      location_name: data.location_name,
      organizer_name: data.organizer_name,
    });

    // Submissions log entry (captured by Vercel log dashboard)
    console.log(
      JSON.stringify({
        log_type: "submission",
        event_id: eventId,
        event_name: data.event_name,
        contact_email: data.contact_email,
        event_start_date: data.event_start_date,
        file_path: filePath,
        status: "draft",
        source: "submission_form",
        has_image_1x1: localImage1x1 !== "",
        has_image_16x9: localImage16x9 !== "",
        emails_sent: emailResult.sent,
        submitted_at: new Date().toISOString(),
        ip: ip,
      }),
    );

    res.status(201).json({
      success: true,
      event_id: eventId,
      event_name: data.event_name,
      message: "Event submitted successfully. It will be reviewed shortly.",
    });
  } catch (error) {
    console.error("Submission failed:", error);
    console.log(
      JSON.stringify({
        log_type: "submission_error",
        event_id: eventId,
        event_name: data.event_name,
        error: error instanceof Error ? error.message : "Unknown error",
        submitted_at: new Date().toISOString(),
        ip: ip,
      }),
    );
    res.status(500).json({
      error: "Failed to submit event. Please try again later.",
    });
  }
}
