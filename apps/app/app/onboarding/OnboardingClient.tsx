"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const STEPS = [
  {
    title: "Welcome to Ascentgen",
    body: "Your Generative Quotient (GQ) traces your body's thermal and metabolic patterns — turning raw temperature and pulse data into a single, meaningful score.",
  },
  {
    title: "How it works",
    body: "Each morning, log your waking temperature and pulse. After a meal, log again. Ascentgen tracks your pattern across 14 days to compute your GQ tier: Dormant, Kindling, or Ascending.",
  },
  {
    title: "Structure is medicine",
    body: "Consistency matters more than perfection. Even partial entries move the needle. The goal is a window into your metabolic health, not another thing to stress about.",
  },
];

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [unit, setUnit] = useState<"F" | "C">("F");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLast = step === STEPS.length;

  async function handleFinish() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      router.push("/login");
      return;
    }

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          temperature_unit: unit,
          onboarding_complete: true,
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      console.error("Onboarding upsert error:", JSON.stringify(upsertError));
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    router.push("/app");
  }

  return (
    <main style={{ maxWidth: 520, margin: "80px auto", padding: "0 24px", fontFamily: "inherit" }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
        {[...STEPS, { title: "Settings" }].map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: i <= step ? "#111" : "#ddd",
            transition: "background 0.2s"
          }} />
        ))}
      </div>

      {!isLast ? (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>{STEPS[step].title}</h1>
          <p style={{ fontSize: 16, color: "#444", lineHeight: 1.7 }}>{STEPS[step].body}</p>
          <button
            onClick={() => setStep(s => s + 1)}
            style={{ marginTop: 40, padding: "12px 32px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, cursor: "pointer" }}
          >
            Continue →
          </button>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>One last thing</h1>
          <p style={{ color: "#555", marginBottom: 32 }}>Which temperature unit do you prefer?</p>

          <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
            {(["F", "C"] as const).map(u => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                style={{
                  padding: "14px 32px", fontSize: 18, fontWeight: 600,
                  background: unit === u ? "#111" : "#f0f0f0",
                  color: unit === u ? "#fff" : "#111",
                  border: "none", borderRadius: 10, cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                °{u}
              </button>
            ))}
          </div>

          {error && <p style={{ color: "red", marginBottom: 16, fontSize: 14 }}>{error}</p>}

          <button
            onClick={handleFinish}
            disabled={saving}
            style={{
              width: "100%", padding: "14px", background: "#111", color: "#fff",
              border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? "Saving…" : "Begin your ascent →"}
          </button>
        </>
      )}
    </main>
  );
}