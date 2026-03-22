import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { getLocale } from "@/lib/server-locale";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://diasporalearn.org/blog/${post.slug}`;
  return {
    title: `${post.title} | DiasporaLearn Blog`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      siteName: "DiasporaLearn",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      ...(post.image ? { images: [{ url: post.image, alt: post.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  if (locale !== "en") redirect("/");

  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "DiasporaLearn", url: "https://diasporalearn.org" },
    url: `https://diasporalearn.org/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <div className={`${serif.variable} ${sans.variable} min-h-screen bg-[#FAFAFA]`} style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: "var(--font-dm-serif)" }} className="text-xl">
            <span className="text-[#2271B3]">D</span><span className="text-[#333]">iasporaLearn</span>
          </Link>
          <nav className="flex gap-6 text-sm text-[#777]">
            <Link href="/blog" className="text-[#333] font-medium">Blog</Link>
            <Link href="/supporters" className="hover:text-[#333]">Our Supporters</Link>
            <a href="mailto:hello@diasporalearn.org" className="hover:text-[#333]">Contact</a>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/blog" className="text-sm text-[#999] hover:text-[#666] mb-8 inline-block">&larr; All posts</Link>

        <article>
          <div className="mb-8">
            <div className="flex items-center gap-3 text-xs text-[#999] mb-3">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              <span>&middot;</span>
              <span>{post.author}</span>
              <span>&middot;</span>
              <span>{post.readTime}</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-3xl md:text-4xl text-[#1a1a1a] leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-[#F0F0F0] text-[#666] px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            {post.image && (
              <div className="mb-6">
                <div className="relative aspect-[2/1] rounded-xl overflow-hidden bg-[#E5E5E5]">
                  <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
                </div>
                {post.imageCredit && (
                  <p className="text-xs text-[#999] mt-2 text-right">{post.imageCredit}</p>
                )}
              </div>
            )}
          </div>

          <div className="prose prose-neutral max-w-none prose-headings:font-[family-name:var(--font-dm-serif)] prose-a:text-[#2271B3] prose-a:no-underline hover:prose-a:underline">
            <MDXRemote source={post.content} />
          </div>
        </article>
      </main>

      <footer className="border-t border-[#E5E5E5] py-8 px-6">
        <div className="max-w-3xl mx-auto text-center text-xs text-[#999]">
          <Link href="/blog" className="hover:text-[#666]">&larr; Back to Blog</Link>
        </div>
      </footer>
    </div>
  );
}
