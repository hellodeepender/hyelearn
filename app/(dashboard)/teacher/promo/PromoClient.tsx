"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface PromoCode {
  id: string; code: string; duration_days: number; max_uses: number;
  current_uses: number; expires_at: string | null; is_active: boolean; created_at: string;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HYE-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function PromoClient({ existingCodes, familyPlanId, userId }: {
  existingCodes: PromoCode[]; familyPlanId: string; userId: string;
}) {
  const router = useRouter();
  const [duration, setDuration] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("promo_codes").insert({
      code: generateCode(),
      plan_id: familyPlanId,
      duration_days: duration,
      max_uses: maxUses,
      created_by: userId,
    });
    setLoading(false);
    router.refresh();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <div className="bg-warm-white border border-brown-100 rounded-xl p-6">
        <h2 className="font-semibold text-brown-800 mb-4">Generate New Code</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">Duration</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm">
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">Max Uses</label>
            <select value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm">
              <option value={1}>1 use</option>
              <option value={5}>5 uses</option>
              <option value={10}>10 uses</option>
              <option value={25}>25 uses</option>
              <option value={100}>100 uses</option>
            </select>
          </div>
        </div>
        <button onClick={handleCreate} disabled={loading}
          className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
          {loading ? "Creating..." : "Generate Code"}
        </button>
      </div>

      {/* Existing codes */}
      <div>
        <h2 className="font-semibold text-brown-800 mb-4">Your Codes</h2>
        {existingCodes.length === 0 ? (
          <p className="text-brown-400 text-sm">No promo codes yet.</p>
        ) : (
          <div className="space-y-2">
            {existingCodes.map((pc) => (
              <div key={pc.id} className="bg-warm-white border border-brown-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono font-medium text-brown-800">{pc.code}</p>
                  <p className="text-xs text-brown-400 mt-0.5">
                    {pc.duration_days} days &middot; {pc.current_uses}/{pc.max_uses} used
                    {!pc.is_active && " \u00B7 Inactive"}
                  </p>
                </div>
                <button onClick={() => copyCode(pc.code)}
                  className="text-sm text-gold hover:text-gold-dark font-medium">
                  {copied === pc.code ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
