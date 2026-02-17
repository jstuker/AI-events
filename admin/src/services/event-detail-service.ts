import type { Event } from "../types/event";
import type { CommitEntry } from "../types/event-form";
import {
  getFileContent,
  updateFileContent,
  getFileCommits,
  getTree,
  getBlob,
} from "./github-api";
import { parseEventFile } from "../utils/event-parser";
import { serializeEventFile } from "../utils/event-serializer";
import { GITHUB_CONFIG } from "../config/github";
import { decodeBase64 } from "../utils/encoding";

interface EventWithSha {
  readonly event: Event;
  readonly sha: string;
}

const EVENT_PATH_PATTERN = new RegExp(
  `^${GITHUB_CONFIG.contentPath}/\\d{4}/\\d{2}/\\d{2}/[^/]+\\.md$`,
);

export function validateEventPath(filePath: string): void {
  if (filePath.includes("..")) {
    throw new Error(`Invalid file path: path traversal not allowed`);
  }
  if (!filePath.startsWith(`${GITHUB_CONFIG.contentPath}/`)) {
    throw new Error(
      `Invalid file path: must start with ${GITHUB_CONFIG.contentPath}/`,
    );
  }
  if (!EVENT_PATH_PATTERN.test(filePath)) {
    throw new Error(
      `Invalid file path: must match pattern ${GITHUB_CONFIG.contentPath}/YYYY/MM/DD/filename.md`,
    );
  }
}

export async function fetchEventByPath(
  token: string,
  filePath: string,
): Promise<EventWithSha> {
  validateEventPath(filePath);
  const file = await getFileContent(token, filePath);
  const content = decodeBase64(file.content);
  const event = parseEventFile(content, filePath);
  return { event, sha: file.sha };
}

export async function fetchEventById(
  token: string,
  eventId: string,
): Promise<EventWithSha> {
  const tree = await getTree(token);
  const pattern = new RegExp(
    `^${GITHUB_CONFIG.contentPath}/\\d{4}/\\d{2}/\\d{2}/[^/]+\\.md$`,
  );
  const eventFiles = tree.tree.filter(
    (item) => item.type === "blob" && pattern.test(item.path),
  );

  for (const file of eventFiles) {
    const blob = await getBlob(token, file.sha);
    const content = decodeBase64(blob.content);
    const event = parseEventFile(content, file.path);
    if (event.event_id === eventId) {
      const fileContent = await getFileContent(token, file.path);
      return { event, sha: fileContent.sha };
    }
  }

  throw new Error(`Event not found: ${eventId}`);
}

export async function saveEvent(
  token: string,
  event: Event,
  filePath: string,
  sha: string,
  message: string,
): Promise<EventWithSha> {
  validateEventPath(filePath);
  const content = serializeEventFile(event);
  const result = await updateFileContent(
    token,
    filePath,
    content,
    message,
    sha,
  );
  return {
    event,
    sha: result.content.sha,
  };
}

export async function fetchEventHistory(
  token: string,
  filePath: string,
): Promise<readonly CommitEntry[]> {
  validateEventPath(filePath);
  const commits = await getFileCommits(token, filePath);
  return commits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author.name,
    date: commit.commit.author.date,
    url: commit.html_url,
  }));
}
