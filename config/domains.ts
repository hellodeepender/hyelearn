export type Locale = "hy" | "el";

export const DEFAULT_LOCALE: Locale = "hy";

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
  },
};

if (process.env.NODE_ENV === "development") {
  DOMAIN_MAP["localhost"] = DOMAIN_MAP["hyelearn.com"];
  DOMAIN_MAP["hyelearn.local"] = DOMAIN_MAP["hyelearn.com"];
  DOMAIN_MAP["mathaino.local"] = DOMAIN_MAP["mathaino.net"];
}

export function getDomainConfig(hostname: string): DomainConfig {
  const cleanHost = hostname.split(":")[0];

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
