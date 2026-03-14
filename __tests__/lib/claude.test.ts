import { describe, it, expect, vi, beforeEach } from "vitest";

// Must mock fetch before importing the module
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import after mocking
const { callClaude } = await import("@/lib/claude");

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  mockFetch.mockReset();
});

describe("callClaude", () => {
  it("throws if ANTHROPIC_API_KEY is not set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    await expect(callClaude("system", "user")).rejects.toThrow("ANTHROPIC_API_KEY is not set");
  });

  it("returns text from successful response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: "Hello from Claude" }] }),
    });

    const result = await callClaude("system prompt", "user prompt");
    expect(result).toBe("Hello from Claude");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "Rate limited",
    });

    await expect(callClaude("system", "user")).rejects.toThrow("Claude API error 429: Rate limited");
  });

  it("throws on unexpected response structure", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [] }),
    });

    await expect(callClaude("system", "user")).rejects.toThrow("unexpected response structure");
  });

  it("sends correct headers", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: "ok" }] }),
    });

    await callClaude("sys", "usr");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-api-key": "test-key",
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        }),
      })
    );
  });

  it("sends correct body with model and messages", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: "ok" }] }),
    });

    await callClaude("my system prompt", "my user prompt");

    const call = mockFetch.mock.calls[0];
    const body = JSON.parse(call[1].body);
    expect(body.model).toBe("claude-sonnet-4-20250514");
    expect(body.system).toBe("my system prompt");
    expect(body.messages).toEqual([{ role: "user", content: "my user prompt" }]);
    expect(body.max_tokens).toBe(4096);
  });
});
