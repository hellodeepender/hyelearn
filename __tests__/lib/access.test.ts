import { describe, it, expect } from "vitest";
import { isSubscriptionActive } from "@/lib/access";

describe("isSubscriptionActive", () => {
  it("returns false for null subscription", () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it("returns true for active subscription without expiry", () => {
    expect(isSubscriptionActive({
      id: "1", status: "active",
      plan: { slug: "family", ai_sessions_limit: -1, features: {} },
      current_period_end: null,
    })).toBe(true);
  });

  it("returns true for gift subscription", () => {
    expect(isSubscriptionActive({
      id: "1", status: "gift",
      plan: { slug: "family", ai_sessions_limit: -1, features: {} },
      current_period_end: null,
    })).toBe(true);
  });

  it("returns true for trial subscription", () => {
    expect(isSubscriptionActive({
      id: "1", status: "trial",
      plan: { slug: "family", ai_sessions_limit: -1, features: {} },
      current_period_end: null,
    })).toBe(true);
  });

  it("returns false for canceled subscription", () => {
    expect(isSubscriptionActive({
      id: "1", status: "canceled",
      plan: { slug: "family", ai_sessions_limit: -1, features: {} },
      current_period_end: null,
    })).toBe(false);
  });

  it("returns false for expired subscription", () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    expect(isSubscriptionActive({
      id: "1", status: "active",
      plan: { slug: "family", ai_sessions_limit: -1, features: {} },
      current_period_end: pastDate,
    })).toBe(false);
  });

  it("returns true for active subscription with future expiry", () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
    expect(isSubscriptionActive({
      id: "1", status: "active",
      plan: { slug: "family", ai_sessions_limit: -1, features: {} },
      current_period_end: futureDate,
    })).toBe(true);
  });

  it("returns false for past_due status", () => {
    expect(isSubscriptionActive({
      id: "1", status: "past_due",
      plan: { slug: "family", ai_sessions_limit: -1, features: {} },
      current_period_end: null,
    })).toBe(false);
  });
});
