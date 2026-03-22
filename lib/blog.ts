import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  author: string;
  image?: string;
  imageCredit?: string;
  readTime: string;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
    const { data, content } = matter(raw);
    const stats = readingTime(content);
    return {
      slug: data.slug || filename.replace(/\.mdx$/, ""),
      title: data.title || "Untitled",
      date: data.date || "2024-01-01",
      description: data.description || "",
      tags: data.tags || [],
      author: data.author || "DiasporaLearn",
      image: data.image || undefined,
      imageCredit: data.imageCredit || undefined,
      readTime: stats.text,
      content,
    } satisfies BlogPost;
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
