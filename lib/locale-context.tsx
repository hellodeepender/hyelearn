"use client";

import { createContext, useContext, ReactNode } from "react";
import { DomainConfig, DOMAIN_MAP } from "@/config/domains";

const LocaleContext = createContext<DomainConfig>(DOMAIN_MAP["hyelearn.com"]);

export function LocaleProvider({
  domainConfig,
  children,
}: {
  domainConfig: DomainConfig;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={domainConfig}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Use in any client component:
 *   const { locale, brandName, fontFamily } = useLocale();
 */
export function useLocale(): DomainConfig {
  return useContext(LocaleContext);
}

export function useCurrentLocale() {
  return useLocale().locale;
}

export function useBrandName() {
  return useLocale().brandName;
}
