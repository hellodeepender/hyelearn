export type Locale = "hy" | "el";

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
      primary: "#C8A951",
      primaryDark: "#B8962E",
      primaryLight: "rgba(200,169,81,0.1)",
      text900: "#1C1408",
      text800: "#3D2E1C",
      text600: "#6B5A45",
      text500: "#8B7A64",
      text400: "#A89880",
      text300: "#C4B8A4",
      bg: "#FAF6EE",
      bgAlt: "rgba(245,239,224,0.4)",
      surface: "#FAF6EE",
      border: "#E8DFCE",
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
      primary: "#2271B3",
      primaryDark: "#1A5A8F",
      primaryLight: "rgba(34,113,179,0.1)",
      text900: "#0C1B2A",
      text800: "#1B3A54",
      text600: "#3D6180",
      text500: "#6A8FAB",
      text400: "#8AACC4",
      text300: "#B0CCDE",
      bg: "#F5F9FC",
      bgAlt: "rgba(234,242,248,0.4)",
      surface: "#F5F9FC",
      border: "#D4E4F0",
      heroOverlay: "#1B3A54",
    },
  },
};

if (process.env.NODE_ENV === "development") {
  DOMAIN_MAP["localhost"] = DOMAIN_MAP["hyelearn.com"];
  DOMAIN_MAP["hyelearn.local"] = DOMAIN_MAP["hyelearn.com"];
  DOMAIN_MAP["mathaino.local"] = DOMAIN_MAP["mathaino.net"];
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
