"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Our Supporters", href: "/supporters" },
  { label: "Contact", href: "mailto:hello@diasporalearn.org" },
];

export default function PortfolioHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#E5E5E5]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl" style={{ fontFamily: "var(--font-dm-serif)" }}>
          <span className="text-[#2271B3]">D</span>
          <span className="text-[#333]">iasporaLearn</span>
        </Link>
        <nav className="flex gap-6 text-sm text-[#777]">
          {NAV_LINKS.map((link) => {
            const isActive = !link.href.startsWith("mailto:") && pathname.startsWith(link.href);
            return link.href.startsWith("mailto:") ? (
              <a key={link.href} href={link.href} className="hover:text-[#333]">{link.label}</a>
            ) : (
              <Link key={link.href} href={link.href} className={isActive ? "text-[#333] font-medium" : "hover:text-[#333]"}>{link.label}</Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
