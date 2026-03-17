import type { Metadata } from "next";
import { Noto_Sans_Armenian, Noto_Sans } from "next/font/google";
import { getServerLocale } from "@/lib/server-locale";
import { LocaleProvider } from "@/lib/locale-context";
import CookieBanner from "@/components/ui/CookieBanner";
import "./globals.css";

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  variable: "--font-noto-armenian",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["greek", "latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerLocale();

  if (locale === "el") {
    return {
      metadataBase: new URL("https://mathaino.net"),
      title: {
        default: "Mathaino — \u039C\u03AC\u03B8\u03B5 \u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC Online",
        template: "%s | Mathaino",
      },
      description:
        "An interactive Greek learning platform for K-5 students. Built for Greek families in the diaspora. Start free.",
      keywords: [
        "Greek language learning", "learn Greek online", "Greek for kids",
        "Greek school curriculum", "Greek alphabet", "Greek vocabulary",
        "Greek diaspora education", "K-5 Greek", "teach Greek to children",
      ],
      authors: [{ name: "Mathaino" }],
      creator: "Mathaino",
      publisher: "Mathaino",
      openGraph: {
        type: "website",
        locale: "el_GR",
        url: "https://mathaino.net",
        siteName: "Mathaino",
        title: "Mathaino — \u039C\u03AC\u03B8\u03B5 \u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC Online",
        description: "Interactive Greek language learning for K-5 students. Built for Greek diaspora families.",
      },
      twitter: {
        card: "summary_large_image",
        title: "Mathaino — \u039C\u03AC\u03B8\u03B5 \u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC Online",
        description: "Interactive Greek language learning for K-5 students.",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" as const, "max-snippet": -1 },
      },
    };
  }

  return {
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
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const domainConfig = await getServerLocale();
  const isGreek = domainConfig.locale === "el";

  const fontClass = isGreek
    ? `${notoSans.variable} font-[family-name:var(--font-noto-sans)]`
    : `${notoSansArmenian.variable} font-[family-name:var(--font-noto-armenian)]`;

  return (
    <html lang={domainConfig.locale} dir={domainConfig.dir}>
      <body className={`${fontClass} antialiased`}>
        <LocaleProvider domainConfig={domainConfig}>
          {children}
          <CookieBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
