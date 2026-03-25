import { getLocale } from "@/lib/server-locale";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import LetterWorldGame from "@/components/games/LetterWorld/LetterWorldGame";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function GamesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-cream">
      <Header userName="" userRole="student" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <StudentNav />
        <LetterWorldGame locale={locale} />
      </main>
    </div>
  );
}
