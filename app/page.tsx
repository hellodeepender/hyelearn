import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { getTranslations } from "@/lib/translations";
import { getServerLocale } from "@/lib/server-locale";

async function checkAuth() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");
    if (profile?.role === "student") redirect("/student");
  } catch {}
}

function Img({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <Image src={src} alt={alt} fill className={`object-cover ${className ?? ""}`} priority={priority} sizes="100vw"
      onError={undefined} />
  );
}

export default async function LandingPage() {
  await checkAuth();

  const { locale } = await getServerLocale();

  // diasporalearn.org shows the portfolio page
  if (locale === "en") {
    const { default: PortfolioPage } = await import("@/app/portfolio/page");
    return <PortfolioPage />;
  }

  const t = await getTranslations("landing");
  const tc = await getTranslations("common");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "name": t("schemaOrgName"),
        "url": t("schemaOrgUrl"),
        "description": t("schemaOrgDesc"),
      },
      {
        "@type": "Course",
        "name": t("schemaCourseName"),
        "description": t("schemaCourseDesc"),
        "provider": { "@type": "Organization", "name": t("schemaOrgName"), "url": t("schemaOrgUrl") },
        "educationalLevel": "K-5",
        "inLanguage": ["en", locale],
        "isAccessibleForFree": true,
        "offers": [
          { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free tier" },
          { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Full Access Monthly" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="fixed top-0 w-full bg-warm-white/80 backdrop-blur-sm border-b border-brown-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{tc("brandLetter")}</span>
            <span className="text-xl font-semibold text-brown-800">{tc("brand")}</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#features" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">{tc("features")}</a>
            <a href="#curriculum" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">{tc("curriculum")}</a>
            <Link href="/sunday-school" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">Sunday School</Link>
            <a href="#pricing" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">{tc("pricing")}</a>
            <Link href="/login" className="text-brown-600 hover:text-brown-800 text-sm">{tc("logIn")}</Link>
            <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {tc("startFree")}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="relative pt-16 min-h-[600px] md:min-h-[700px] flex items-center">
          <div className="absolute inset-0 bg-brown-800">
            <Img src={locale === "el" ? "/images/hero-greece-el.jpg" : "/images/hero-ararat.jpg"} alt={t("heroImageAlt")} priority className="opacity-40" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-cream/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg shadow-black/20">
                {tc("startFree")}
              </Link>
              <a href="#schools" className="border-2 border-white/40 hover:border-white/60 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors">
                {tc("forSchools")}
              </a>
            </div>
            <p className="text-cream/60 text-sm">{t("freeForever")}</p>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how-it-works" className="py-20 px-6 bg-warm-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-4">{t("howItWorksTitle")}</h2>
            <p className="text-brown-500 text-center mb-14 max-w-xl mx-auto">{t("howItWorksSubtitle")}</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "\uD83D\uDC64", title: t("step1Title"), desc: t("step1Desc") },
                { icon: "\u2728", title: t("step2Title"), desc: t("step2Desc") },
                { icon: "\uD83C\uDFC6", title: t("step3Title"), desc: t("step3Desc") },
              ].map((s) => (
                <div key={s.title} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-3xl mx-auto mb-4">{s.icon}</div>
                  <h3 className="font-semibold text-brown-800 text-lg mb-2">{s.title}</h3>
                  <p className="text-brown-500 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FEATURES SHOWCASE ============ */}
        <section id="features" className="py-20 px-6 bg-cream/40">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-14">{t("featuresTitle")}</h2>

            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brown-100">
                <Img src={locale === "el" ? "/images/screenshot-lesson-el.jpg" : "/images/screenshot-lesson.jpg"} alt={t("feature1ImageAlt")} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brown-800 mb-3">{t("feature1Title")}</h3>
                <p className="text-brown-500 leading-relaxed">{t("feature1Desc")}</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="md:order-2 relative aspect-[4/3] rounded-2xl overflow-hidden bg-brown-100">
                <Img src={locale === "el" ? "/images/screenshot-dashboard-el.jpg" : "/images/screenshot-dashboard.jpg"} alt={t("feature2ImageAlt")} />
              </div>
              <div className="md:order-1">
                <h3 className="text-2xl font-bold text-brown-800 mb-3">{t("feature2Title")}</h3>
                <p className="text-brown-500 leading-relaxed">{t("feature2Desc")}</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brown-100">
                <Img src={locale === "el" ? "/images/kids-tablet-el.jpg" : "/images/kids-tablet.jpg"} alt={t("feature3ImageAlt")} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brown-800 mb-3">{t("feature3Title")}</h3>
                <p className="text-brown-500 leading-relaxed">{t("feature3Desc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CURRICULUM PREVIEW ============ */}
        <section id="curriculum" className="py-20 px-6 bg-warm-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-4">{t("curriculumTitle")}</h2>
            <p className="text-brown-500 text-center mb-12 max-w-xl mx-auto">{t("curriculumSubtitle")}</p>
            <div className="space-y-3">
              {[
                { grade: t("kindergarten"), icon: "\uD83C\uDF1F", desc: t("kindergartenDesc"), expanded: true },
                { grade: t("grade1"), icon: "\uD83D\uDCD6", desc: t("grade1Desc") },
                { grade: t("grade2"), icon: "\uD83D\uDCD5", desc: t("grade2Desc") },
                { grade: t("grade3"), icon: "\u270D\uFE0F", desc: t("grade3Desc") },
                { grade: t("grade4"), icon: "\uD83D\uDCDA", desc: t("grade4Desc") },
                { grade: t("grade5"), icon: "\uD83C\uDF93", desc: t("grade5Desc") },
              ].map((g) => (
                <div key={g.grade} className="bg-warm-white border border-brown-100 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{g.icon}</span>
                    <span className="font-semibold text-brown-800">{g.grade}</span>
                  </div>
                  {g.expanded ? (
                    <p className="text-brown-500 text-sm mt-2 ml-9">{g.desc}</p>
                  ) : (
                    <p className="text-brown-400 text-sm mt-1 ml-9">{g.desc}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FOR SCHOOLS ============ */}
        <section id="schools" className="py-20 px-6 bg-brown-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-4">{t("schoolsTitle")}</h2>
            <p className="text-brown-500 text-center mb-14 max-w-xl mx-auto">{t("schoolsSubtitle")}</p>
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {[
                { icon: "\uD83D\uDCCA", title: t("schoolFeature1Title"), desc: t("schoolFeature1Desc") },
                { icon: "\uD83C\uDFEB", title: t("schoolFeature2Title"), desc: t("schoolFeature2Desc") },
                { icon: "\uD83D\uDCB0", title: t("schoolFeature3Title"), desc: t("schoolFeature3Desc") },
              ].map((f) => (
                <div key={f.title} className="bg-warm-white border border-brown-100 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-brown-800 mb-2">{f.title}</h3>
                  <p className="text-brown-500 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/contact" className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                {t("contactSchoolPricing")}
              </Link>
              <p className="text-brown-400 text-sm mt-3">{t("orEmailSchools")}</p>
            </div>
          </div>
        </section>

        {/* ============ WHY BRAND ============ */}
        <section className="py-20 px-6 bg-warm-white">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-6">{t("whyTitle")}</h2>
            <p className="text-brown-500 leading-relaxed text-center max-w-2xl mx-auto">{t("whyDesc")}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-brown-800 text-center mb-10">{t("whatMakesDifferentTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: tc("brandLetter"), title: t("diff1Title"), desc: t("diff1Desc") },
                { icon: "\uD83C\uDFD4\uFE0F", title: t("diff2Title"), desc: t("diff2Desc") },
                { icon: "\u23F1\uFE0F", title: t("diff3Title"), desc: t("diff3Desc") },
              ].map((c) => (
                <div key={c.title} className="bg-cream/50 border border-brown-100 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-3">{c.icon}</div>
                  <h3 className="font-semibold text-brown-800 mb-2">{c.title}</h3>
                  <p className="text-brown-500 text-sm leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section id="pricing" className="py-20 px-6 bg-cream/40">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brown-800 mb-3">{t("pricingTitle")}</h2>
            <p className="text-brown-500">{t("pricingSubtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-warm-white border-2 border-gold rounded-2xl p-8 relative shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">Full Access</span>
              <h3 className="text-lg font-semibold text-brown-800">{t("planFreeTitle")}</h3>
              <p className="text-4xl font-bold text-brown-800 mt-4">{t("planFreePrice")}</p>
              <p className="text-sm text-brown-400 mt-1">{t("planFreePeriod")}</p>
              <ul className="mt-6 space-y-3 text-sm text-brown-600">
                <li>{"\u2713"} {t("planFreeFeature1")}</li>
                <li>{"\u2713"} {t("planFreeFeature2")}</li>
                <li>{"\u2713"} {t("planFreeFeature3")}</li>
                <li>{"\u2713"} {t("planFreeFeature4")}</li>
              </ul>
              <Link href="/signup" className="block mt-8 text-center bg-gold hover:bg-gold-dark text-white py-3 rounded-lg font-medium transition-colors">
                {tc("startFree")}
              </Link>
            </div>
            <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-brown-800">{t("planPaidTitle")}</h3>
              <p className="text-4xl font-bold text-brown-800 mt-4">{t("planPaidPrice")}</p>
              <p className="text-sm text-brown-400 mt-1">{t("planPaidPeriod")}</p>
              <ul className="mt-6 space-y-3 text-sm text-brown-600">
                <li>{"\u2713"} {t("planPaidFeature1")}</li>
                <li>{"\u2713"} {t("planPaidFeature2")}</li>
                <li>{"\u2713"} {t("planPaidFeature3")}</li>
                <li>{"\u2713"} {t("planPaidFeature4")}</li>
              </ul>
              <Link href="/pricing" className="block mt-8 text-center border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium transition-colors">
                {t("planPaidTitle")}
              </Link>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/contact" className="text-sm text-brown-500 hover:text-brown-700">
              {t("planSchoolTitle")}: {t("contactUs")} &rarr;
            </Link>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="py-20 px-6 bg-warm-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-brown-800 text-center mb-10">{t("faqTitle")}</h2>
            <div className="space-y-4">
              {[
                { q: t("faq1Q"), a: t("faq1A") },
                { q: t("faq2Q"), a: t("faq2A") },
                { q: t("faq3Q"), a: t("faq3A") },
                { q: t("faq4Q"), a: t("faq4A") },
                { q: t("faq5Q"), a: t("faq5A") },
                { q: t("faq6Q"), a: t("faq6A") },
                { q: t("faq7Q"), a: t("faq7A") },
                { q: t("faq8Q"), a: t("faq8A") },
              ].map((f) => (
                <div key={f.q} className="bg-cream/30 border border-brown-100 rounded-xl p-5">
                  <h3 className="font-semibold text-brown-800 text-sm">{f.q}</h3>
                  <p className="text-sm text-brown-500 mt-1.5">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="relative py-24 px-6">
          <div className="absolute inset-0 bg-brown-800">
            <Img src={locale === "el" ? "/images/greek-parthenon-el.jpg" : "/images/alphabet-monument.jpg"} alt={t("ctaImageAlt")} className="opacity-30" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">{t("ctaTitle")}</h2>
            <p className="text-brown-300 mb-8 text-lg">{t("ctaSubtitle")}</p>
            <Link href="/signup" className="inline-block bg-gold hover:bg-gold-light text-brown-900 px-10 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg">
              {t("startLearningFree")}
            </Link>
            <p className="text-brown-400 text-sm mt-6">{t("ctaContact")}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 bg-brown-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gold">{tc("brandLetter")}</span>
              <span className="text-lg font-semibold text-cream">{tc("brand")}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-brown-400">
              <Link href="/" className="hover:text-brown-300">{t("home")}</Link>
              <Link href="/pricing" className="hover:text-brown-300">{tc("pricing")}</Link>
              <Link href="/supporters" className="hover:text-brown-300">Supporters</Link>
              <Link href="/contact" className="hover:text-brown-300">{t("contact")}</Link>
              <Link href="/privacy" className="hover:text-brown-300">{t("privacy")}</Link>
              <Link href="/terms" className="hover:text-brown-300">{t("terms")}</Link>
              <Link href="/cookies" className="hover:text-brown-300">{t("cookies")}</Link>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-brown-500 mt-2 mb-4">
            <span>Part of the</span>
            <a href="https://diasporalearn.org" target="_blank" rel="noopener noreferrer" className="text-brown-400 hover:text-brown-300 underline">DiasporaLearn</a>
            <span>family</span>
            <span className="text-brown-700">&middot;</span>
            <span>Also available:</span>
            {locale === "el" ? (
              <a href="https://hyelearn.com" target="_blank" rel="noopener noreferrer" className="text-brown-400 hover:text-brown-300 underline">HyeLearn (Armenian)</a>
            ) : (
              <a href="https://mathaino.net" target="_blank" rel="noopener noreferrer" className="text-brown-400 hover:text-brown-300 underline">Mathaino (Greek)</a>
            )}
          </div>
          <div className="border-t border-brown-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-brown-500 text-xs">{t("footerTagline")}</p>
            <p className="text-brown-500 text-xs">&copy; {new Date().getFullYear()} {t("footerCopyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
