import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put } from "@vercel/blob";
import {
  createRateLimitMap,
  isRateLimited,
  getClientIp,
} from "./lib/rate-limit.js";
import { getAllowedOrigins } from "./lib/cors.js";

// Disable default body parsing so we can read raw file bytes
export const config = {
  api: {
    bodyParser: false,
  },
};

const rateLimitMap = createRateLimitMap();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

// Magic byte signatures for image types
const MAGIC_BYTES: ReadonlyMap<string, readonly number[][]> = new Map([
  ["image/jpeg", [[0xff, 0xd8, 0xff]]],
  ["image/jpg", [[0xff, 0xd8, 0xff]]],
  ["image/png", [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]]],
  [
    "image/gif",
    [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
  ],
]);

function validateMagicBytes(buffer: Buffer, contentType: string): boolean {
  const signatures = MAGIC_BYTES.get(contentType);
  if (!signatures) return false;
  return signatures.some((sig) =>
    sig.every((byte, i) => buffer.length > i && buffer[i] === byte),
  );
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
  const ip = getClientIp(
    req.headers as Record<string, string | string[] | undefined>,
  );
  if (isRateLimited(rateLimitMap, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
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

    // Validate magic bytes match declared content type
    if (!validateMagicBytes(body, contentType)) {
      res.status(400).json({
        error: "File content does not match declared type.",
      });
      return;
    }

    // Generate a safe pathname using a cryptographic random ID
    const ext =
      contentType === "image/png"
        ? "png"
        : contentType === "image/gif"
          ? "gif"
          : "jpg";
    const safeId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
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
