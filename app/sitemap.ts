import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getServerLocale } from "@/lib/server-locale";
import { DOMAIN_MAP } from "@/config/domains";
import { getAllPosts } from "@/lib/blog";

/** Locales that have their own dedicated domain (hy, el, ar, en) */
function getLocalesWithDomains(): Set<string> {
  const locales = new Set<string>();
  for (const config of Object.values(DOMAIN_MAP)) {
    locales.add(config.locale);
  }
  return locales;
}

/** Generate /learn/ URLs for a given locale, appending ?locale= suffix when needed */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCurriculumUrls(
  db: any,
  baseUrl: string,
  locale: string,
  now: Date,
  localeParam?: string, // if set, appends ?locale=X to every URL
): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [];
  const qs = localeParam ? `?locale=${localeParam}` : "";

  pages.push({
    url: `${baseUrl}/learn${qs}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  });

  const { data: levels } = await db
    .from("curriculum_levels")
    .select("id, slug")
    .eq("locale", locale)
    .eq("is_active", true) as { data: { id: string; slug: string }[] | null };

  if (!levels) return pages;

  for (const level of levels) {
    pages.push({
      url: `${baseUrl}/learn/${level.slug}${qs}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    });

    const { data: units } = await db
      .from("curriculum_units")
      .select("id, slug")
      .eq("level_id", level.id)
      .eq("is_active", true)
      .eq("locale", locale) as { data: { id: string; slug: string }[] | null };

    if (units) {
      for (const unit of units) {
        pages.push({
          url: `${baseUrl}/learn/${level.slug}/${unit.slug}${qs}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        });

        const { data: lessons } = await db
          .from("curriculum_lessons")
          .select("slug")
          .eq("unit_id", unit.id)
          .eq("is_active", true)
          .eq("locale", locale) as { data: { slug: string }[] | null };

        if (lessons) {
          for (const lesson of lessons) {
            pages.push({
              url: `${baseUrl}/learn/${level.slug}/${unit.slug}/${lesson.slug}${qs}`,
              lastModified: now,
              changeFrequency: "monthly" as const,
              priority: 0.8,
            });
          }
        }
      }
    }
  }

  return pages;
}

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // diasporalearn.org — parent site with blog + domainless locale curricula
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

    // Find locales that have curriculum data but no dedicated domain
    const domainlessPages: MetadataRoute.Sitemap = [];
    try {
      const domainLocales = getLocalesWithDomains();
      const { data: allLocales } = await db
        .from("curriculum_levels")
        .select("locale")
        .eq("is_active", true);

      if (allLocales) {
        const uniqueLocales = [...new Set(allLocales.map((r) => r.locale as string))];
        const domainless = uniqueLocales.filter((l) => l && !domainLocales.has(l));

        for (const loc of domainless) {
          const urls = await getCurriculumUrls(db, baseUrl, loc, now, loc);
          domainlessPages.push(...urls);
        }
      }
    } catch (err) {
      console.error("[sitemap] Error fetching domainless locales:", err);
    }

    return [...staticPages, ...blogPages, ...domainlessPages];
  }

  // Language sites (hyelearn.com, mathaino.net, ta3allam.org) — auth + curriculum
  const authPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const curriculumPages: MetadataRoute.Sitemap = [];
  try {
    const urls = await getCurriculumUrls(db, baseUrl, locale, now);
    curriculumPages.push(...urls);

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
