import type { Metadata } from "next";
import { Noto_Sans_Armenian } from "next/font/google";
import "./globals.css";

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  variable: "--font-noto-armenian",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HyeLearn — AI-Powered Armenian Learning",
  description:
    "AI-powered bilingual Armenian practice for schools. Western Armenian + English exercises with adaptive difficulty.",
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
      </body>
    </html>
  );
}
