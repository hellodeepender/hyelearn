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

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.href.startsWith("mailto:")) return true;
    return !pathname.startsWith(link.href);
  });

  return (
    <nav className="flex gap-6 text-sm text-brown-500">
      {visibleLinks.map((link) =>
        link.href.startsWith("mailto:") ? (
          <a key={link.href} href={link.href} className="hover:text-brown-800">{link.label}</a>
        ) : (
          <Link key={link.href} href={link.href} className="hover:text-brown-800">{link.label}</Link>
        )
      )}
    </nav>
  );
}
