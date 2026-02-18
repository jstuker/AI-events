import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put } from "@vercel/blob";

// Disable default body parsing so we can read raw file bytes
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- Rate limiting ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

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

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  if (origin && allowedOrigins.some((allowed) => origin === allowed)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Content-Type");

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
      error: "Too many uploads. Please try again in a minute.",
    });
    return;
  }

  try {
    // Validate content type from custom header (browser sets multipart for FormData)
    const contentType = req.headers["x-content-type"] as string | undefined;
    if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
      res.status(400).json({
        error: "Invalid file type. Allowed: JPEG, PNG, GIF.",
      });
      return;
    }

    // Read the raw body as a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const body = Buffer.concat(chunks);

    if (body.length === 0) {
      res.status(400).json({ error: "No file provided." });
      return;
    }

    if (body.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: "File too large. Maximum 10 MB." });
      return;
    }

    // Generate a safe pathname using a random ID
    const ext =
      contentType === "image/png"
        ? "png"
        : contentType === "image/gif"
          ? "gif"
          : "jpg";
    const safeId = Math.random().toString(36).slice(2, 14);
    const pathname = `event-images/${safeId}.${ext}`;

    const blob = await put(pathname, body, {
      access: "public",
      contentType,
    });

    res.status(200).json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload error:", error);
    res.status(500).json({ error: message });
  }
}
