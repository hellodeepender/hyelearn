import { describe, it, expect } from "vitest";
import { getSystemPrompt, buildUserPrompt } from "@/lib/prompts";

describe("getSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = getSystemPrompt();
    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe("string");
  });

  it("contains Western Armenian instruction", () => {
    expect(getSystemPrompt()).toContain("WESTERN Armenian");
  });

  it("contains JSON-only instruction", () => {
    expect(getSystemPrompt()).toContain("Return ONLY valid JSON");
  });

  it("contains emoji rules", () => {
    expect(getSystemPrompt()).toContain("fill_blank exercises");
    expect(getSystemPrompt()).toContain("CORRECT ANSWER");
  });
});

describe("buildUserPrompt", () => {
  it("builds multiple_choice prompt for standard grade", () => {
    const prompt = buildUserPrompt("5", "vocabulary", "Animals", "multiple_choice", 4);
    expect(prompt).toContain("Grade 5");
    expect(prompt).toContain("Animals");
    expect(prompt).toContain("4 options");
  });

  it("builds fill_blank prompt", () => {
    const prompt = buildUserPrompt("3", "grammar", "Verb Conjugation", "fill_blank", 3);
    expect(prompt).toContain("fill-in-the-blank");
    expect(prompt).toContain("Grade 3");
    expect(prompt).toContain("___");
  });

  it("builds matching prompt", () => {
    const prompt = buildUserPrompt("4", "vocabulary", "Family", "matching", 5);
    expect(prompt).toContain("matching pairs");
    expect(prompt).toContain("5");
  });

  it("builds true_false prompt", () => {
    const prompt = buildUserPrompt("6", "culture", "Armenian Holidays", "true_false", 4);
    expect(prompt).toContain("true/false");
    expect(prompt).toContain("correct_answer");
  });

  it("uses young learner prompt for Kindergarten", () => {
    const prompt = buildUserPrompt("K", "vocabulary", "Colors", "multiple_choice", 3);
    expect(prompt).toContain("Kindergarten");
    expect(prompt).toContain("emoji");
    expect(prompt).toContain("young learners");
  });

  it("uses young learner prompt for Grade 1", () => {
    const prompt = buildUserPrompt("1", "vocabulary", "Animals", "fill_blank", 3);
    expect(prompt).toContain("Grade 1");
    expect(prompt).toContain("emoji");
    expect(prompt).toContain("young learners");
  });

  it("does not include emoji for standard grades", () => {
    const prompt = buildUserPrompt("5", "vocabulary", "Animals", "multiple_choice", 4);
    expect(prompt).not.toContain("emoji");
  });
});
