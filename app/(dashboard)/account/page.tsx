import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createClient as createDbClient } from "@supabase/supabase-js";
import Header from "@/components/ui/Header";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createDbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : supabase;

  const { data: sub } = await db
    .from("subscriptions")
    .select("status, current_period_end, stripe_customer_id, plans!inner(name, slug)")
    .eq("user_id", user.id)
    .in("status", ["active", "trial", "gift"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const plan = sub ? (sub.plans as unknown as { name: string; slug: string }) : null;

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "User"} userRole={profile?.role ?? "student"} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-brown-800 mb-6">Account & Billing</h1>

        <div className="bg-warm-white border border-brown-100 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-medium text-brown-500 mb-1">Current Plan</h2>
          <p className="text-2xl font-bold text-brown-800">{plan?.name ?? "Free"}</p>
          {sub && (
            <p className="text-sm text-brown-400 mt-1">
              Status: <span className="capitalize">{sub.status}</span>
              {sub.current_period_end && ` \u00B7 Renews ${new Date(sub.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
            </p>
          )}
        </div>

        <AccountClient
          hasStripe={!!sub?.stripe_customer_id}
          planSlug={plan?.slug ?? "free"}
        />
      </main>
    </div>
  );
}
