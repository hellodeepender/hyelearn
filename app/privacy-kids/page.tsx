import Link from "next/link";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DiasporaLearn Kids — Privacy Policy",
  description:
    "Privacy policy for the DiasporaLearn Kids mobile app. No data collection, no accounts, no tracking.",
};

const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const items = [
  {
    title: "No data collection.",
    body: "The app does not collect, store, or transmit any personal data.",
  },
  {
    title: "No accounts.",
    body: "No user accounts or login are required.",
  },
  {
    title: "Works offline.",
    body: "The app works entirely offline — no internet connection is needed.",
  },
  {
    title: "No analytics or tracking.",
    body: "No analytics, tracking, cookies, or advertising of any kind.",
  },
  {
    title: "No in-app purchases.",
    body: "The app contains no in-app purchases or monetization.",
  },
  {
    title: "No third-party sharing.",
    body: "No data is shared with third parties.",
  },
  {
    title: "No device access.",
    body: "The app does not access the device camera, microphone, contacts, or location.",
  },
  {
    title: "Local storage only.",
    body: "All learning progress is stored locally on the device only.",
  },
];

export default function PrivacyKidsPage() {
  return (
    <div
      className={`${serif.variable} ${sans.variable} min-h-screen bg-[#FAFAFA]`}
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <header className="border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            <span className="text-[#2271B3]">D</span>
            <span className="text-[#333]">iasporaLearn</span>
          </Link>
          <Link href="/" className="text-sm text-[#777] hover:text-[#333]">
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1
          style={{ fontFamily: "var(--font-dm-serif)" }}
          className="text-3xl text-[#1a1a1a] mb-2"
        >
          DiasporaLearn Kids — Privacy Policy
        </h1>
        <p className="text-sm text-[#999] mb-12">Last updated: March 27, 2026</p>

        <div className="space-y-6 text-[#555] leading-relaxed">
          <p>
            DiasporaLearn Kids is a free educational app for children ages 3–12.
            It helps children learn Armenian, Greek, and Arabic through
            interactive games and activities.
          </p>

          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#2271B3] font-bold mt-0.5">—</span>
                <span>
                  <strong className="text-[#1a1a1a]">{item.title}</strong>{" "}
                  {item.body}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#E5E5E5] pt-6 mt-8">
            <p className="text-sm text-[#777]">
              Questions? Contact us at{" "}
              <a
                href="mailto:hello@diasporalearn.org"
                className="text-[#2271B3] hover:underline"
              >
                hello@diasporalearn.org
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto text-center text-xs text-[#bbb]">
          <p>
            &copy; {new Date().getFullYear()} DiasporaLearn. Heritage language
            education for diaspora communities worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
