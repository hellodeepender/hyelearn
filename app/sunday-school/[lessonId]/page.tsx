import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getLocale, getServerLocale } from "@/lib/server-locale";
import AudioPlayButton from "@/components/ui/AudioPlayButton";

interface KeyPhrase {
  native: string;
  transliteration: string;
  english: string;
  audio_url?: string;
}

interface VocabWord {
  word_native: string;
  word_transliteration: string;
  word_english: string;
  usage_example?: string;
  audio_url?: string;
}

interface Opening {
  prayer_native?: string;
  prayer_transliteration?: string;
  prayer_english?: string;
  instructions?: string;
  audio_url?: string;
}

interface Story {
  teacher_script?: string;
  key_phrases?: KeyPhrase[];
}

interface Activity {
  type?: "discussion" | "game" | "craft";
  instructions?: string;
  questions?: string[];
}

interface Closing {
  prayer_native?: string;
  prayer_transliteration?: string;
  prayer_english?: string;
  audio_url?: string;
}

interface SundayLesson {
  id: string;
  unit_id: string;
  lesson_number: number;
  title: string;
  title_native: string;
  opening: Opening | null;
  story: Story | null;
  vocabulary: VocabWord[] | null;
  activity: Activity | null;
  closing: Closing | null;
  liturgical_themes: string[] | null;
  age_notes: string | null;
  sunday_units: { title: string; title_native: string } | null;
}

export default async function SundayLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const locale = await getLocale();
  const { brandName } = await getServerLocale();
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("sunday_lessons")
    .select("id, unit_id, lesson_number, title, title_native, opening, story, vocabulary, activity, closing, liturgical_themes, age_notes, sunday_units(title, title_native)")
    .eq("id", lessonId)
    .eq("locale", locale)
    .single();

  if (!lesson) notFound();

  const typedLesson = lesson as unknown as SundayLesson;
  const { opening, story, vocabulary, activity, closing } = typedLesson;

  // Fetch prev/next
  const { data: prevLesson } = await supabase
    .from("sunday_lessons")
    .select("id, title, lesson_number")
    .eq("locale", locale)
    .lt("lesson_number", typedLesson.lesson_number)
    .order("lesson_number", { ascending: false })
    .limit(1)
    .single();

  const { data: nextLesson } = await supabase
    .from("sunday_lessons")
    .select("id, title, lesson_number")
    .eq("locale", locale)
    .gt("lesson_number", typedLesson.lesson_number)
    .order("lesson_number")
    .limit(1)
    .single();

  const isGreek = locale === "el";
  const accent = isGreek ? "text-blue-600" : "text-gold";
  const accentBg = isGreek ? "bg-blue-600" : "bg-gold";
  const accentBorder = isGreek ? "border-blue-200" : "border-gold/20";
  const accentBgLight = isGreek ? "bg-blue-50" : "bg-gold/5";
  const nativeFont = isGreek ? "text-xl" : "text-xl";

  const unitTitle = typedLesson.sunday_units?.title ?? "";

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-warm-white border-b border-brown-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/sunday-school" className="flex items-center gap-1 text-sm text-brown-500 hover:text-brown-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Lessons
          </Link>
          <span className="text-xs text-brown-400">Lesson {typedLesson.lesson_number}</span>
          {/* Placeholder menu */}
          <button className="text-brown-400 hover:text-brown-600 text-xs" title="Coming soon" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        {/* Lesson title */}
        <div className="mb-8">
          <p className="text-xs font-medium text-brown-400 uppercase mb-1">
            {unitTitle} {"\u00B7"} Week {typedLesson.lesson_number}
          </p>
          <h1 className="text-2xl font-bold text-brown-800">{typedLesson.title}</h1>
          {typedLesson.title_native && (
            <p className={`text-lg ${accent} font-medium mt-1`}>{typedLesson.title_native}</p>
          )}
          {typedLesson.liturgical_themes && typedLesson.liturgical_themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {typedLesson.liturgical_themes.map((theme) => (
                <span key={theme} className={`text-xs px-2.5 py-1 rounded-full ${accentBgLight} ${accent} font-medium`}>
                  {theme}
                </span>
              ))}
            </div>
          )}
          {typedLesson.age_notes && (
            <p className="text-xs text-brown-400 mt-2 italic">{typedLesson.age_notes}</p>
          )}
        </div>

        {/* 1. Opening Prayer */}
        {opening && (opening.prayer_native || opening.instructions) && (
          <LessonSection title="Opening Prayer" icon={"\uD83D\uDE4F"} borderColor={accentBorder}>
            {opening.instructions && (
              <p className="text-sm text-brown-500 italic mb-4">{opening.instructions}</p>
            )}
            {opening.prayer_native && (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <p className={`${nativeFont} font-semibold text-brown-800 leading-relaxed flex-1`}>{opening.prayer_native}</p>
                  <AudioPlayButton url={opening.audio_url} />
                </div>
                {opening.prayer_transliteration && (
                  <p className="text-sm text-brown-500 italic">{opening.prayer_transliteration}</p>
                )}
                {opening.prayer_english && (
                  <p className="text-sm text-brown-400">{opening.prayer_english}</p>
                )}
              </div>
            )}
          </LessonSection>
        )}

        {/* 2. This Week's Story */}
        {story && (story.teacher_script || (story.key_phrases && story.key_phrases.length > 0)) && (
          <LessonSection title="This Week&apos;s Story" icon={"\uD83D\uDCD6"} borderColor={accentBorder}>
            {story.teacher_script && (
              <div className="text-brown-700 leading-relaxed whitespace-pre-line mb-4">
                {story.teacher_script}
              </div>
            )}
            {story.key_phrases && story.key_phrases.length > 0 && (
              <div className="space-y-3 mt-4">
                <p className="text-xs font-medium text-brown-400 uppercase">Key Phrases</p>
                {story.key_phrases.map((phrase, i) => (
                  <div key={i} className={`${accentBgLight} border ${accentBorder} rounded-lg p-3`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className={`font-semibold text-brown-800 ${nativeFont}`}>{phrase.native}</p>
                        <p className="text-sm text-brown-500 italic">{phrase.transliteration}</p>
                        <p className="text-sm text-brown-400">{phrase.english}</p>
                      </div>
                      <AudioPlayButton url={phrase.audio_url} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </LessonSection>
        )}

        {/* 3. Vocabulary */}
        {vocabulary && vocabulary.length > 0 && (
          <LessonSection title="Vocabulary" icon={"\uD83D\uDCDD"} borderColor={accentBorder}>
            <div className="grid gap-3">
              {vocabulary.map((word, i) => (
                <div key={i} className="bg-warm-white border border-brown-100 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-bold text-brown-800 ${nativeFont}`}>{word.word_native}</p>
                      <p className="text-sm text-brown-500 italic">{word.word_transliteration}</p>
                      <p className="text-sm text-brown-400">{word.word_english}</p>
                    </div>
                    <AudioPlayButton url={word.audio_url} />
                  </div>
                  {word.usage_example && (
                    <p className="text-xs text-brown-400 mt-2 border-t border-brown-50 pt-2">{word.usage_example}</p>
                  )}
                </div>
              ))}
            </div>
          </LessonSection>
        )}

        {/* 4. Activity */}
        {activity && (activity.instructions || (activity.questions && activity.questions.length > 0)) && (
          <LessonSection title="Activity" icon={"\uD83C\uDFAE"} borderColor={accentBorder}>
            {activity.type && (
              <span className={`inline-block text-xs font-semibold uppercase px-2.5 py-1 rounded-full mb-3 ${
                activity.type === "discussion" ? "bg-purple-50 text-purple-600" :
                activity.type === "game" ? "bg-green-50 text-green-600" :
                "bg-orange-50 text-orange-600"
              }`}>
                {activity.type}
              </span>
            )}
            {activity.instructions && (
              <p className="text-brown-700 leading-relaxed mb-4">{activity.instructions}</p>
            )}
            {activity.questions && activity.questions.length > 0 && (
              <ol className="space-y-2">
                {activity.questions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-brown-700">
                    <span className={`w-6 h-6 rounded-full ${accentBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{q}</span>
                  </li>
                ))}
              </ol>
            )}
          </LessonSection>
        )}

        {/* 5. Closing Prayer */}
        {closing && closing.prayer_native && (
          <LessonSection title="Closing Prayer" icon={"\uD83D\uDE4F"} borderColor={accentBorder}>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <p className={`${nativeFont} font-semibold text-brown-800 leading-relaxed flex-1`}>{closing.prayer_native}</p>
                <AudioPlayButton url={closing.audio_url} />
              </div>
              {closing.prayer_transliteration && (
                <p className="text-sm text-brown-500 italic">{closing.prayer_transliteration}</p>
              )}
              {closing.prayer_english && (
                <p className="text-sm text-brown-400">{closing.prayer_english}</p>
              )}
            </div>
          </LessonSection>
        )}

        {/* Prev / Next navigation */}
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-brown-100">
          {prevLesson ? (
            <Link href={`/sunday-school/${prevLesson.id}`} className="flex items-center gap-2 text-sm text-brown-500 hover:text-brown-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              <div className="text-left">
                <p className="text-xs text-brown-400">Previous</p>
                <p className="font-medium">{prevLesson.title}</p>
              </div>
            </Link>
          ) : <div />}
          {nextLesson ? (
            <Link href={`/sunday-school/${nextLesson.id}`} className="flex items-center gap-2 text-sm text-brown-500 hover:text-brown-700 transition-colors text-right">
              <div>
                <p className="text-xs text-brown-400">Next</p>
                <p className="font-medium">{nextLesson.title}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          ) : <div />}
        </nav>
      </main>

      <footer className="py-6 px-6 border-t border-brown-100 mt-6">
        <div className="max-w-3xl mx-auto text-center text-xs text-brown-400">
          <Link href="/sunday-school" className="hover:text-brown-600">&larr; All lessons</Link>
          <span className="mx-3">&middot;</span>
          <Link href="/" className="hover:text-brown-600">{brandName}</Link>
        </div>
      </footer>
    </div>
  );
}

function LessonSection({ title, icon, borderColor, children }: { title: string; icon: string; borderColor: string; children: React.ReactNode }) {
  return (
    <section className={`mb-8 border-l-4 ${borderColor} pl-5`}>
      <h2 className="text-sm font-semibold text-brown-800 uppercase tracking-wide mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}
