"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

const SISTER_SITES = [
  { locale: "hy", name: "HyeLearn", label: "Armenian", url: "https://hyelearn.com" },
  { locale: "el", name: "Mathaino", label: "Greek", url: "https://mathaino.net" },
  { locale: "ar", name: "Ta3allam", label: "Arabic", url: "https://ta3allam.org" },
  { locale: "tl", name: "Tagalog", label: "Tagalog", url: "https://diasporalearn.org/learn?locale=tl" },
];

const LINKEDIN_SVG = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface Props {
  showFeedback?: boolean;
}

export default function SiteFooter({ showFeedback = false }: Props) {
  const { locale, brandName, supportEmail } = useLocale();
  const otherSites = SISTER_SITES.filter((s) => s.locale !== locale);

  return (
    <footer className="mt-10 py-6 px-6 border-t border-brown-100">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-2 text-xs text-brown-400">
        {showFeedback && (
          <a
            href={`mailto:${supportEmail}?subject=Feedback for ${brandName}`}
            className="text-gold hover:text-gold-dark font-medium text-sm transition-colors"
          >
            Send Feedback
          </a>
        )}
        <span>{brandName} &middot; Made with love for diaspora communities</span>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          <a href="https://diasporalearn.org" target="_blank" rel="noopener noreferrer" className="hover:text-brown-600">DiasporaLearn</a>
          <span>&middot;</span>
          <Link href="/sunday-school" className="hover:text-brown-600">Sunday School</Link>
          <span>&middot;</span>
          <Link href="/pricing" className="hover:text-brown-600">Support Us</Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {otherSites.map((site, i) => (
            <span key={site.locale} className="flex items-center gap-3">
              {i > 0 && <span>&middot;</span>}
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="hover:text-brown-600">
                {site.name} ({site.label})
              </a>
            </span>
          ))}
          <a href="https://www.linkedin.com/company/diasporalearn/" target="_blank" rel="noopener noreferrer" className="hover:text-brown-600 transition-colors" aria-label="LinkedIn">
            {LINKEDIN_SVG}
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1 text-brown-300">
          <span>&copy; {new Date().getFullYear()} {brandName}</span>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-brown-400">Privacy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-brown-400">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
