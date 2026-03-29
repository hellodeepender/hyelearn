import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getServerLocale } from "@/lib/server-locale";
import { getAllPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { url: baseUrl, locale } = await getServerLocale();
  const now = new Date();

  // Static pages shared across all domains
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/supporters`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/sunday-school`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // diasporalearn.org — parent site with blog, no curriculum pages
  if (locale === "en") {
    const blogPages: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ];
    const posts = getAllPosts();
    for (const post of posts) {
      blogPages.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
    return [...staticPages, ...blogPages];
  }

  // Language sites (hyelearn.com, mathaino.net, ta3allam.org) — add auth + curriculum pages
  const authPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Fetch curriculum structure from Supabase — public /learn/ URLs
  const curriculumPages: MetadataRoute.Sitemap = [];
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    // /learn overview
    curriculumPages.push({
      url: `${baseUrl}/learn`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    });

    const { data: levels } = await db
      .from("curriculum_levels")
      .select("id, slug")
      .eq("locale", locale)
      .eq("is_active", true);

    if (levels) {
      for (const level of levels) {
        curriculumPages.push({
          url: `${baseUrl}/learn/${level.slug}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        });

        const { data: units } = await db
          .from("curriculum_units")
          .select("id, slug")
          .eq("level_id", level.id)
          .eq("is_active", true)
          .eq("locale", locale);

        if (units) {
          for (const unit of units) {
            curriculumPages.push({
              url: `${baseUrl}/learn/${level.slug}/${unit.slug}`,
              lastModified: now,
              changeFrequency: "monthly" as const,
              priority: 0.6,
            });

            const { data: lessons } = await db
              .from("curriculum_lessons")
              .select("slug")
              .eq("unit_id", unit.id)
              .eq("is_active", true)
              .eq("locale", locale);

            if (lessons) {
              for (const lesson of lessons) {
                curriculumPages.push({
                  url: `${baseUrl}/learn/${level.slug}/${unit.slug}/${lesson.slug}`,
                  lastModified: now,
                  changeFrequency: "monthly" as const,
                  priority: 0.8,
                });
              }
            }
          }
        }
      }
    }

    // Sunday school lesson pages
    const { data: sundayLessons } = await db
      .from("sunday_lessons")
      .select("id")
      .eq("locale", locale)
      .order("lesson_number");

    if (sundayLessons) {
      for (const lesson of sundayLessons) {
        curriculumPages.push({
          url: `${baseUrl}/sunday-school/${lesson.id}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (err) {
    console.error("[sitemap] Error fetching curriculum:", err);
  }

  return [...staticPages, ...authPages, ...curriculumPages];
}
