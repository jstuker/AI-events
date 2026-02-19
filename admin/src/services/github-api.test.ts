import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTree,
  getBlob,
  getFileContent,
  updateFileContent,
  createFileContent,
  getFileCommits,
} from "./github-api";
import { createTreeResponse, createBlobResponse } from "../test/fixtures";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("getTree", () => {
  it("fetches the repository tree with auth header", async () => {
    const treeData = createTreeResponse([
      "content/events/2026/03/15/evt-001.md",
    ]);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(treeData),
    });

    const result = await getTree("test-token");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toContain("/git/trees/main?recursive=1");
    expect(options.headers.Authorization).toBe("Bearer test-token");
    expect(result).toEqual(treeData);
  });

  it("throws on 401 unauthorized", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    await expect(getTree("bad-token")).rejects.toThrow(
      "GitHub API error: 401 Unauthorized",
    );
  });

  it("throws on 404 not found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(getTree("token")).rejects.toThrow(
      "GitHub API error: 404 Not Found",
    );
  });

  it("throws on 500 server error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(getTree("token")).rejects.toThrow(
      "GitHub API error: 500 Internal Server Error",
    );
  });
});

describe("getBlob", () => {
  it("fetches blob content by SHA", async () => {
    const blobData = createBlobResponse("test content");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(blobData),
    });

    const result = await getBlob("test-token", "sha123");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toContain("/git/blobs/sha123");
    expect(options.headers.Authorization).toBe("Bearer test-token");
    expect(result).toEqual(blobData);
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });

    await expect(getBlob("token", "sha123")).rejects.toThrow(
      "GitHub API error: 403 Forbidden",
    );
  });
});

describe("getFileContent", () => {
  it("fetches file content by path", async () => {
    const fileData = {
      name: "test.md",
      path: "content/test.md",
      sha: "sha456",
      content: btoa("hello"),
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fileData),
    });

    const result = await getFileContent("test-token", "content/test.md");

    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toContain("/contents/content/test.md?ref=main");
    expect(options.headers.Authorization).toBe("Bearer test-token");
    expect(result).toEqual(fileData);
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(getFileContent("token", "missing.md")).rejects.toThrow(
      "GitHub API error: 404 Not Found",
    );
  });
});

describe("updateFileContent", () => {
  it("updates file content and returns response", async () => {
    const updateData = {
      content: { sha: "new-sha" },
      commit: { sha: "commit-sha" },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updateData),
    });

    const result = await updateFileContent(
      "test-token",
      "content/test.md",
      "new content",
      "update msg",
      "old-sha",
    );

    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toContain("/contents/content/test.md");
    expect(options.method).toBe("PUT");
    expect(options.headers.Authorization).toBe("Bearer test-token");
    const body = JSON.parse(options.body);
    expect(body.message).toBe("update msg");
    expect(body.sha).toBe("old-sha");
    expect(body.branch).toBe("main");
    expect(result).toEqual(updateData);
  });

  it("throws conflict error on 409", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      statusText: "Conflict",
    });

    await expect(
      updateFileContent("token", "path", "content", "msg", "sha"),
    ).rejects.toThrow("Conflict: the file has been modified by another user");
  });

  it("throws generic error on other failures", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(
      updateFileContent("token", "path", "content", "msg", "sha"),
    ).rejects.toThrow("GitHub API error: 500 Internal Server Error");
  });
});

describe("createFileContent", () => {
  it("creates file and returns response", async () => {
    const createData = {
      content: { sha: "new-sha" },
      commit: { sha: "commit-sha" },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(createData),
    });

    const result = await createFileContent(
      "test-token",
      "content/new.md",
      btoa("hello"),
      "create msg",
    );

    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toContain("/contents/content/new.md");
    expect(options.method).toBe("PUT");
    const body = JSON.parse(options.body);
    expect(body.message).toBe("create msg");
    expect(body.content).toBe(btoa("hello"));
    expect(body.branch).toBe("main");
    expect(result).toEqual(createData);
  });

  it("throws on 422 when file already exists", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
    });

    await expect(
      createFileContent("token", "path", "content", "msg"),
    ).rejects.toThrow("File already exists at this path");
  });

  it("throws generic error on other failures", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(
      createFileContent("token", "path", "content", "msg"),
    ).rejects.toThrow("GitHub API error: 500 Internal Server Error");
  });
});

describe("getFileCommits", () => {
  it("fetches commit history for a file", async () => {
    const commits = [
      {
        sha: "c1",
        commit: { message: "first", author: { name: "A", date: "2026-01-01" } },
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(commits),
    });

    const result = await getFileCommits("test-token", "content/events/test.md");

    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toContain("/commits?path=content%2Fevents%2Ftest.md&sha=main");
    expect(options.headers.Authorization).toBe("Bearer test-token");
    expect(result).toEqual(commits);
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });

    await expect(getFileCommits("token", "path")).rejects.toThrow(
      "GitHub API error: 403 Forbidden",
    );
  });
});
