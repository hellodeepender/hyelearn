import Link from "next/link";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import { getAllPosts } from "@/lib/blog";
import { getLocale } from "@/lib/server-locale";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | DiasporaLearn",
  description: "Articles about heritage language learning, diaspora education, and building tools for families who want to keep their languages alive.",
  alternates: { canonical: "https://diasporalearn.org/blog" },
};

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export default async function BlogIndex() {
  const locale = await getLocale();
  if (locale !== "en") redirect("/");

  const posts = getAllPosts();

  return (
    <div className={`${serif.variable} ${sans.variable} min-h-screen bg-[#FAFAFA]`} style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
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
        <h1 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-4xl text-[#1a1a1a] mb-3">Blog</h1>
        <p className="text-[#777] mb-12">Articles about heritage language learning and diaspora education.</p>

        {posts.length === 0 ? (
          <p className="text-[#999]">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`} className="block bg-white border border-[#E5E5E5] rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 text-xs text-[#999] mb-3">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </time>
                    <span>&middot;</span>
                    <span>{post.author}</span>
                    <span>&middot;</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-xl text-[#1a1a1a] mb-2 group-hover:text-[#2271B3] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#555] text-sm leading-relaxed mb-3">{post.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-[#F0F0F0] text-[#666] px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#E5E5E5] py-8 px-6">
        <div className="max-w-3xl mx-auto text-center text-xs text-[#999]">
          <Link href="/" className="hover:text-[#666]">&larr; Back to DiasporaLearn</Link>
        </div>
      </footer>
    </div>
  );
}
