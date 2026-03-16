import type { Metadata } from "next";
import { Noto_Sans_Armenian } from "next/font/google";
import CookieBanner from "@/components/ui/CookieBanner";
import "./globals.css";

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  variable: "--font-noto-armenian",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hyelearn.com"),
  title: {
    default: "HyeLearn — Learn Western Armenian Online | K-5 Curriculum",
    template: "%s | HyeLearn",
  },
  description:
    "The first interactive Western Armenian learning platform for K-5 students. Used by Armenian day schools and families in the diaspora. Start free.",
  keywords: [
    "Armenian language learning", "Western Armenian", "learn Armenian online",
    "Armenian for kids", "Armenian school curriculum", "Armenian alphabet",
    "Armenian vocabulary", "Armenian diaspora education", "Armenian day school",
    "K-5 Armenian", "teach Armenian to children",
  ],
  authors: [{ name: "HyeLearn" }],
  creator: "HyeLearn",
  publisher: "HyeLearn",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hyelearn.com",
    siteName: "HyeLearn",
    title: "HyeLearn — Learn Western Armenian Online",
    description: "Interactive Armenian language learning for K-5 students. Built for Armenian day schools and diaspora families.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "HyeLearn - Learn Armenian Online" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HyeLearn — Learn Western Armenian Online",
    description: "Interactive Armenian language learning for K-5 students.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" as const, "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSansArmenian.variable} font-[family-name:var(--font-noto-armenian)] antialiased`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
