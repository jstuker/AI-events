import { createFileContent } from "./github-api";
import { GITHUB_CONFIG } from "../config/github";

export interface ImageUploadResult {
  readonly path: string;
  readonly sha: string;
}

function imageRepoPath(eventId: string, filename: string): string {
  return `static/images/events/${eventId}/${filename}`;
}

function imagePublicPath(eventId: string, filename: string): string {
  return `/images/events/${eventId}/${filename}`;
}

export function previewUrl(imagePath: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_CONFIG.repoOwner}/${GITHUB_CONFIG.repoName}/${GITHUB_CONFIG.branch}/static${imagePath}`;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function extensionFromFile(file: File): string {
  const parts = file.name.split(".");
  const last = parts[parts.length - 1];
  return parts.length > 1 && last ? last.toLowerCase() : "jpg";
}

export async function uploadEventImage(
  file: File,
  token: string,
  eventId: string,
  imageType: "1x1" | "16x9",
): Promise<ImageUploadResult> {
  const ext = extensionFromFile(file);
  const filename = `image-${imageType}.${ext}`;
  const repoPath = imageRepoPath(eventId, filename);
  const publicPath = imagePublicPath(eventId, filename);

  const base64Content = await readFileAsBase64(file);
  const message = `chore: upload ${imageType} image for event ${eventId}`;

  const response = await createFileContent(
    token,
    repoPath,
    base64Content,
    message,
  );

  return {
    path: publicPath,
    sha: response.content.sha,
  };
}
