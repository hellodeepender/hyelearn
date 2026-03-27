import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support DiasporaLearn — Donate to Heritage Language Education",
  description: "Support DiasporaLearn with a donation. Help keep Armenian, Greek, and Arabic language education accessible for diaspora families worldwide.",
  alternates: { canonical: "https://diasporalearn.org/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
