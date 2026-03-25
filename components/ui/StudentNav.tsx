"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/student", label: "Dashboard", icon: "\u{1F3E0}" },
  { href: "/student/curriculum", label: "Curriculum", icon: "\u{1F4D6}" },
  { href: "/student/games", label: "Games", icon: "\uD83C\uDFAE" },
  { href: "/practice", label: "Extra Practice", icon: "\u2728" },
];

interface Props {
  subscriptionTier?: string;
}

export default function StudentNav({ subscriptionTier: _tier }: Props = {}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 bg-warm-white border border-brown-100 rounded-xl p-1 mb-8">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/student"
          ? pathname === "/student"
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-gold/10 text-gold-dark"
                : "text-brown-500 hover:text-brown-700 hover:bg-brown-50"
            }`}
          >
            <span>{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
