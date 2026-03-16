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
  title: "HyeLearn — Armenian Language Learning for Kids",
  description:
    "HyeLearn teaches Western Armenian to children through structured, curriculum-based lessons. Built by an Armenian mom, trusted by families. Start free.",
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
