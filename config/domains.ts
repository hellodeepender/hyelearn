export type Locale = "hy" | "el" | "en" | "ar" | "tl";

export const DEFAULT_LOCALE: Locale = "hy";

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  text900: string;
  text800: string;
  text600: string;
  text500: string;
  text400: string;
  text300: string;
  bg: string;
  bgAlt: string;
  surface: string;
  border: string;
  heroOverlay: string;
}

export interface DomainConfig {
  locale: Locale;
  brandName: string;
  nativeName: string;
  englishName: string;
  fontFamily: string;
  dir: "ltr" | "rtl";
  supportEmail: string;
  noreplyEmail: string;
  url: string;
  theme: ThemeColors;
}

export const DOMAIN_MAP: Record<string, DomainConfig> = {
  "hyelearn.com": {
    locale: "hy",
    brandName: "HyeLearn",
    nativeName: "\u0540\u0561\u0575\u0565\u0580\u0567\u0576",
    englishName: "Armenian",
    fontFamily: "'Noto Sans Armenian', sans-serif",
    dir: "ltr",
    supportEmail: "support@hyelearn.com",
    noreplyEmail: "noreply@hyelearn.com",
    url: "https://hyelearn.com",
    theme: {
      primary: "#C4384B",
      primaryDark: "#A02E3E",
      primaryLight: "rgba(196,56,75,0.1)",
      text900: "#1C1408",
      text800: "#3D2E1C",
      text600: "#6B5A45",
      text500: "#8B7A64",
      text400: "#A89880",
      text300: "#C4B8A4",
      bg: "#FDF8F4",
      bgAlt: "rgba(251,240,232,0.4)",
      surface: "#FDF8F4",
      border: "#F0DDD0",
      heroOverlay: "#3D2E1C",
    },
  },
  "mathaino.net": {
    locale: "el",
    brandName: "Mathaino",
    nativeName: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC",
    englishName: "Greek",
    fontFamily: "'Noto Sans', sans-serif",
    dir: "ltr",
    supportEmail: "support@mathaino.net",
    noreplyEmail: "noreply@mathaino.net",
    url: "https://mathaino.net",
    theme: {
      primary: "#1A6AFF",
      primaryDark: "#0A4FD4",
      primaryLight: "rgba(26,106,255,0.1)",
      text900: "#0A1A3A",
      text800: "#0A2A5C",
      text600: "#3D5A85",
      text500: "#5A85B8",
      text400: "#7AA0CC",
      text300: "#A8C4E0",
      bg: "#F0F7FF",
      bgAlt: "rgba(224,236,255,0.4)",
      surface: "#F0F7FF",
      border: "#B8D4F0",
      heroOverlay: "#0A2A5C",
    },
  },
  "diasporalearn.org": {
    locale: "en" as Locale,
    brandName: "DiasporaLearn",
    nativeName: "DiasporaLearn",
    englishName: "Heritage Languages",
    fontFamily: "'DM Sans', sans-serif",
    dir: "ltr",
    supportEmail: "hello@diasporalearn.org",
    noreplyEmail: "noreply@diasporalearn.org",
    url: "https://diasporalearn.org",
    theme: {
      primary: "#2271B3",
      primaryDark: "#1A5A8F",
      primaryLight: "rgba(34,113,179,0.1)",
      text900: "#1a1a1a",
      text800: "#333333",
      text600: "#555555",
      text500: "#777777",
      text400: "#999999",
      text300: "#bbbbbb",
      bg: "#FAFAFA",
      bgAlt: "rgba(250,250,250,0.4)",
      surface: "#FFFFFF",
      border: "#E5E5E5",
      heroOverlay: "#1a1a1a",
    },
  },
  "ta3allam.org": {
    locale: "ar" as Locale,
    brandName: "Ta3allam",
    nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    englishName: "Arabic",
    fontFamily: "'Noto Sans Arabic', sans-serif",
    dir: "ltr",
    supportEmail: "support@ta3allam.org",
    noreplyEmail: "noreply@ta3allam.org",
    url: "https://ta3allam.org",
    theme: {
      primary: "#2E7D32",
      primaryDark: "#1B5E20",
      primaryLight: "rgba(46,125,50,0.1)",
      text900: "#1A1A0A",
      text800: "#2E2E1C",
      text600: "#5A5A3D",
      text500: "#7A7A5A",
      text400: "#9A9A7A",
      text300: "#BABAA0",
      bg: "#FAFAF5",
      bgAlt: "rgba(245,245,235,0.4)",
      surface: "#FAFAF5",
      border: "#E0E0C8",
      heroOverlay: "#2E2E1C",
    },
  },
};

if (process.env.NODE_ENV === "development") {
  DOMAIN_MAP["localhost"] = DOMAIN_MAP["hyelearn.com"];
  DOMAIN_MAP["hyelearn.local"] = DOMAIN_MAP["hyelearn.com"];
  DOMAIN_MAP["mathaino.local"] = DOMAIN_MAP["mathaino.net"];
  DOMAIN_MAP["ta3allam.local"] = DOMAIN_MAP["ta3allam.org"];
}

export function getDomainConfig(hostname: string): DomainConfig {
  const cleanHost = hostname.split(":")[0].replace(/^www\./, "");

  if (DOMAIN_MAP[cleanHost]) {
    return DOMAIN_MAP[cleanHost];
  }

  for (const config of Object.values(DOMAIN_MAP)) {
    if (cleanHost.startsWith(`${config.locale}--`) || cleanHost.startsWith(`${config.locale}.`)) {
      return config;
    }
  }

  return DOMAIN_MAP["hyelearn.com"];
}
