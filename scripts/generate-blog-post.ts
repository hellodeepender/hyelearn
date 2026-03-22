/**
 * Auto-generate a blog post using Claude Opus + Unsplash image.
 * Usage: ANTHROPIC_API_KEY=sk-... UNSPLASH_ACCESS_KEY=... npx tsx scripts/generate-blog-post.ts
 */

import fs from "fs";
import path from "path";
import https from "https";
import Anthropic from "@anthropic-ai/sdk";
import { createApi } from "unsplash-js";
import { getAllPosts } from "../lib/blog";

const CONTENT_PILLARS = [
  "Heritage language tips for parents — practical advice for teaching Arabic, Armenian, or Greek at home",
  "Word of the week — teach a useful word or phrase in Arabic, Armenian, and Greek with cultural context",
  "Cultural education — explore a holiday, tradition, recipe, or custom from Arabic, Armenian, or Greek culture",
  "Bilingual parenting advice — research-backed strategies for raising multilingual children in the diaspora",
  "Language learning research — summarize a study or finding about bilingualism, heritage languages, or childhood language acquisition",
  "Diaspora community resources — highlight organizations, events, or programs that support heritage language communities",
  "Sunday school teaching tips — practical advice for teachers running Armenian, Greek, or Arabic Sunday school programs",
  "Alphabet fun facts — interesting stories behind Arabic, Armenian, or Greek letters and writing systems",
];

const SYSTEM_PROMPT = `You are ghostwriting blog posts for Deepy, the founder of DiasporaLearn — a free heritage language learning platform for diaspora children (Armenian at hyelearn.com, Greek at mathaino.net, Arabic at ta3allam.org).

Write in first person as Deepy. The voice is:
- Warm but direct, like talking to a friend at a community event
- Personal — reference real diaspora experiences (Sunday school memories, grandparents switching languages, kids refusing to speak the heritage language)
- Practical — every post should give parents or teachers something actionable
- Opinionated — take a stance, don't hedge everything
- Culturally specific — mention real things (Armenian lavash, Greek yiayia, Arabic dallah coffee, church potlucks, community picnics)

Structure guidelines:
- Open with a personal story or observation, never with a generic statement
- Use short paragraphs (2-3 sentences max)
- Include subheadings that are conversational, not keyword-stuffed
- End with a genuine CTA, not a sales pitch
- Vary post formats: some listicles, some stories, some opinion pieces, some how-tos
- Target 800-1200 words
- Include 2-3 natural keyword phrases for SEO without forcing them

NEVER start a post with "In today's world" or "As a parent" or "In this blog post" or any generic opening. Start with something specific and human.

NEVER use these phrases: "In conclusion", "It goes without saying", "At the end of the day", "In this digital age", "leverage", "foster", "holistic", "empower", "journey" (as metaphor), "navigate" (as metaphor), "deep dive".

Example good opening: "Last Sunday, I watched a 7-year-old at our church try to read the Lord's Prayer in Armenian. She got through three words before looking up at her mom with that face — you know the one."

Example bad opening: "Heritage language learning is an important part of maintaining cultural identity for diaspora families."

Output format — return ONLY the frontmatter and markdown content, nothing else:

---
title: "Your Post Title Here"
date: "YYYY-MM-DD"
description: "A compelling 1-2 sentence description for SEO and social sharing."
tags: ["tag1", "tag2", "tag3"]
slug: "your-post-slug-here"
author: "Dean S"
---

Your markdown content here...`;

function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(dest);
          return downloadImage(redirectUrl, dest).then(resolve).catch(reject);
        }
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      fs.unlink(dest, () => {}); // Clean up on error
      reject(err);
    });
  });
}

async function fetchUnsplashImage(
  tags: string[],
  slug: string,
): Promise<{ imagePath: string; credit: string } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log("UNSPLASH_ACCESS_KEY not set — skipping image");
    return null;
  }

  const unsplash = createApi({
    accessKey,
    fetch: globalThis.fetch,
  });

  // Build a search query from tags
  const query = tags.slice(0, 3).join(" ") + " children learning";

  try {
    const result = await unsplash.search.getPhotos({
      query,
      perPage: 5,
      orientation: "landscape",
    });

    if (result.errors || !result.response?.results?.length) {
      console.log("No Unsplash images found for query:", query);
      return null;
    }

    // Pick a random image from top 5 for variety
    const photos = result.response.results;
    const photo = photos[Math.floor(Math.random() * photos.length)];

    const imageUrl = photo.urls.regular; // 1080px wide
    const credit = `Photo by ${photo.user.name} on Unsplash`;

    // Download to public/images/blog/
    const imageDir = path.join(process.cwd(), "public", "images", "blog");
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    const imageDest = path.join(imageDir, `${slug}.jpg`);
    console.log(`Downloading image from Unsplash...`);
    await downloadImage(imageUrl, imageDest);

    // Trigger download event for Unsplash API guidelines
    await unsplash.photos.trackDownload({ downloadLocation: photo.links.download_location });

    const imagePath = `/images/blog/${slug}.jpg`;
    console.log(`Image saved: ${imageDest}`);
    console.log(`Credit: ${credit}`);

    return { imagePath, credit };
  } catch (err) {
    console.error("Unsplash error (non-fatal):", err);
    return null;
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is required");
    process.exit(1);
  }

  const existingPosts = getAllPosts();
  const existingSlugs = existingPosts.map((p) => p.slug);
  const existingTitles = existingPosts.map((p) => p.title);

  // Pick a content pillar, rotating based on the week number
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const pillar = CONTENT_PILLARS[weekNum % CONTENT_PILLARS.length];

  const today = new Date().toISOString().split("T")[0];

  const userPrompt = `Write a blog post for DiasporaLearn.

Content pillar for this week: ${pillar}

Today's date: ${today}

Existing posts (do NOT repeat these topics):
${existingTitles.map((t, i) => `- "${t}" (${existingSlugs[i]})`).join("\n")}

Generate a fresh, original post following the content pillar. Use today's date in the frontmatter. Make the slug URL-friendly (lowercase, hyphens, no special characters).`;

  const client = new Anthropic({ apiKey });

  console.log(`Generating blog post for pillar: "${pillar}"...`);
  console.log(`Model: claude-sonnet-4-20250514`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  let text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  if (!text.startsWith("---")) {
    console.error("Unexpected output format — expected frontmatter. Got:", text.slice(0, 200));
    process.exit(1);
  }

  // Extract slug and tags from frontmatter
  const slugMatch = text.match(/slug:\s*"([^"]+)"/);
  if (!slugMatch) {
    console.error("Could not extract slug from frontmatter");
    process.exit(1);
  }
  const slug = slugMatch[1];

  if (existingSlugs.includes(slug)) {
    console.error(`Slug "${slug}" already exists — aborting to avoid overwrite`);
    process.exit(1);
  }

  const tagsMatch = text.match(/tags:\s*\[([^\]]+)\]/);
  const tags = tagsMatch
    ? tagsMatch[1].split(",").map((t) => t.trim().replace(/^"|"$/g, ""))
    : [];

  // Fetch Unsplash image
  const imageResult = await fetchUnsplashImage(tags, slug);

  // Inject image and imageCredit into frontmatter if we got one
  if (imageResult) {
    // Insert image fields before the closing ---
    const frontmatterEnd = text.indexOf("---", 3);
    if (frontmatterEnd > 0) {
      const before = text.slice(0, frontmatterEnd);
      const after = text.slice(frontmatterEnd);
      text = `${before}image: "${imageResult.imagePath}"\nimageCredit: "${imageResult.credit}"\n${after}`;
    }
  }

  const blogDir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  const filePath = path.join(blogDir, `${slug}.mdx`);
  fs.writeFileSync(filePath, text.trim() + "\n");

  console.log(`\nBlog post created: ${filePath}`);
  console.log(`Slug: ${slug}`);
  console.log(`Title: ${text.match(/title:\s*"([^"]+)"/)?.[1] || "unknown"}`);
  console.log(`Tags: ${tags.join(", ")}`);
  console.log(`Image: ${imageResult ? imageResult.imagePath : "none (no UNSPLASH_ACCESS_KEY)"}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
