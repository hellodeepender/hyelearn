import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createClient as createDbClient } from "@supabase/supabase-js";
import Header from "@/components/ui/Header";
import PromoClient from "./PromoClient";

export default async function PromoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createDbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : supabase;

  const { data: profile } = await db.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role === "student") redirect("/student");

  const { data: codes } = await db
    .from("promo_codes")
    .select("id, code, duration_days, max_uses, current_uses, expires_at, is_active, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const { data: familyPlan } = await db.from("plans").select("id").eq("slug", "family").single();

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Teacher"} userRole={profile?.role ?? "teacher"} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-brown-800 mb-6">Promo Codes</h1>
        <PromoClient
          existingCodes={codes ?? []}
          familyPlanId={familyPlan?.id ?? ""}
          userId={user.id}
        />
      </main>
    </div>
  );
}
