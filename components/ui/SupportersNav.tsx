"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Our Supporters", href: "/supporters" },
  { label: "Contact", href: "mailto:hello@diasporalearn.org" },
];

export default function SupportersNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 text-sm text-brown-500">
      {NAV_LINKS.map((link) => {
        const isActive = !link.href.startsWith("mailto:") && pathname.startsWith(link.href);
        return link.href.startsWith("mailto:") ? (
          <a key={link.href} href={link.href} className="hover:text-brown-800">{link.label}</a>
        ) : (
          <Link key={link.href} href={link.href} className={isActive ? "text-brown-800 font-medium" : "hover:text-brown-800"}>{link.label}</Link>
        );
      })}
    </nav>
  );
}
