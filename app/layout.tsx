import type { Metadata } from "next";
import { Noto_Sans_Armenian, Noto_Sans, Noto_Sans_Arabic } from "next/font/google";
import { getServerLocale } from "@/lib/server-locale";
import { LocaleProvider } from "@/lib/locale-context";
import CookieBanner from "@/components/ui/CookieBanner";
import AuthHashHandler from "@/components/ui/AuthHashHandler";
import GoogleAnalytics from "@/components/ui/GoogleAnalytics";
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";
import NativeApp from "@/components/ui/NativeApp";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import GlobalErrorHandler from "@/components/ui/GlobalErrorHandler";
import SoundPreloader from "@/components/ui/SoundPreloader";
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

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerLocale();

  if (locale === "en") {
    return {
      metadataBase: new URL("https://diasporalearn.org"),
      title: {
        default: "DiasporaLearn — Heritage Language Learning for Diaspora Children",
        template: "%s | DiasporaLearn",
      },
      description: "Armenian, Greek, and Arabic language learning for diaspora kids. Complete K-5 curriculum with interactive lessons, audio pronunciation, Sunday school content, and cultural rewards.",
      keywords: [
        "diaspora language learning", "heritage language", "Armenian for kids", "Greek for kids",
        "Arabic for kids", "K-5 curriculum", "Sunday school lessons", "diaspora education",
      ],
      authors: [{ name: "DiasporaLearn" }],
      creator: "DiasporaLearn",
      publisher: "DiasporaLearn",
      alternates: { canonical: "https://diasporalearn.org" },
      openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://diasporalearn.org",
        siteName: "DiasporaLearn",
        title: "DiasporaLearn — Heritage Language Learning for Diaspora Children",
        description: "Armenian, Greek, and Arabic language learning for diaspora kids. Interactive K-5 curriculum and Sunday school lessons.",
        images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "DiasporaLearn - Heritage Language Learning" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "DiasporaLearn — Heritage Language Learning",
        description: "Armenian, Greek, and Arabic language learning for diaspora kids.",
        images: ["/og-image.svg"],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" as const, "max-snippet": -1 },
      },
    };
  }

  if (locale === "el") {
    return {
      metadataBase: new URL("https://mathaino.net"),
      title: {
        default: "Mathaino — Learn Modern Greek | Heritage Language for Diaspora Kids",
        template: "%s | Mathaino",
      },
      description:
        "Interactive K-5 Modern Greek curriculum for diaspora children. Audio pronunciation, cultural lessons, Sunday school content, and progress tracking.",
      alternates: { canonical: "https://mathaino.net" },
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
        images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Mathaino - Learn Greek Online" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Mathaino — \u039C\u03AC\u03B8\u03B5 \u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC Online",
        description: "Interactive Greek language learning for K-5 students.",
        images: ["/og-image.svg"],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" as const, "max-snippet": -1 },
      },
    };
  }

  if (locale === "ar") {
    return {
      metadataBase: new URL("https://ta3allam.org"),
      title: {
        default: "Ta3allam \u2014 Learn Arabic | Heritage Language for Diaspora Kids",
        template: "%s | Ta3allam",
      },
      description: "Interactive K-5 Arabic curriculum for diaspora children. Audio pronunciation, cultural lessons, and progress tracking.",
      alternates: { canonical: "https://ta3allam.org" },
      keywords: [
        "Arabic language learning", "learn Arabic online", "Arabic for kids",
        "Arabic alphabet", "Arabic vocabulary", "Arabic diaspora education",
        "K-5 Arabic", "teach Arabic to children", "ta3allam",
        "\u062A\u0639\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A\u0629", "\u0639\u0631\u0628\u064A \u0644\u0644\u0623\u0637\u0641\u0627\u0644",
        "\u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
      ],
      authors: [{ name: "Ta3allam" }],
      creator: "Ta3allam",
      publisher: "Ta3allam",
      openGraph: {
        type: "website",
        locale: "ar_SA",
        url: "https://ta3allam.org",
        siteName: "Ta3allam",
        title: "Ta3allam \u2014 Learn Arabic | Heritage Language for Diaspora Kids",
        description: "Interactive Arabic language learning for K-5 students. Built for Arabic-speaking diaspora families.",
        images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Ta3allam - Learn Arabic Online" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Ta3allam \u2014 Learn Arabic Online",
        description: "Interactive Arabic language learning for K-5 students.",
        images: ["/og-image.svg"],
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
      default: "HyeLearn — Learn Western Armenian | Heritage Language for Diaspora Kids",
      template: "%s | HyeLearn",
    },
    description:
      "Interactive K-5 Western Armenian curriculum for diaspora children. Audio pronunciation, cultural lessons, Sunday school content, and progress tracking.",
    alternates: { canonical: "https://hyelearn.com" },
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

  const fontClass =
    domainConfig.locale === "el" || domainConfig.locale === "tl" ? `${notoSans.variable} font-[family-name:var(--font-noto-sans)]` :
    domainConfig.locale === "ar" ? `${notoSansArabic.variable} font-[family-name:var(--font-noto-arabic)]` :
    `${notoSansArmenian.variable} font-[family-name:var(--font-noto-armenian)]`;

  const t = domainConfig.theme;

  return (
    <html lang="en" dir={domainConfig.dir} data-locale={domainConfig.locale}>
      <head>
        <link rel="manifest" href="/api/manifest" />
        <meta name="theme-color" content={t.primary} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={domainConfig.brandName} />
        <link rel="apple-touch-icon" href={`/icons/icon-${domainConfig.locale}-192.png`} />
        <link rel="icon" href={`/icons/icon-${domainConfig.locale}.svg`} type="image/svg+xml" />
        <link rel="icon" href={`/icons/icon-${domainConfig.locale}-192.png`} type="image/png" sizes="192x192" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --theme-primary: ${t.primary};
            --theme-primary-dark: ${t.primaryDark};
            --theme-primary-light: ${t.primaryLight};
            --theme-text-900: ${t.text900};
            --theme-text-800: ${t.text800};
            --theme-text-600: ${t.text600};
            --theme-text-500: ${t.text500};
            --theme-text-400: ${t.text400};
            --theme-text-300: ${t.text300};
            --theme-bg: ${t.bg};
            --theme-bg-alt: ${t.bgAlt};
            --theme-surface: ${t.surface};
            --theme-border: ${t.border};
            --theme-hero-overlay: ${t.heroOverlay};
          }
        `}} />
      </head>
      <body className={`${fontClass} antialiased`}>
        <LocaleProvider domainConfig={domainConfig}>
          <GoogleAnalytics />
          <AuthHashHandler />
          <ServiceWorkerRegister />
          <NativeApp />
          <GlobalErrorHandler />
          <SoundPreloader />
          <ErrorBoundary locale={domainConfig.locale}>
            {children}
          </ErrorBoundary>
          <CookieBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
