"use client";
// app/onboarding/OnboardingClient.tsx
// Fix: upsert uses temperature_unit (not temp_unit) to match DB schema

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const supabase = createClient(); // sync, module-level is fine for browser client

const STEPS = [
  {
    id: "welcome",
    heading: "Your ascent begins here.",
    sub: "Ascentgen tracks four readings—waking temperature, post‑meal temperature, waking pulse, post‑meal pulse—and turns them into your Generative Quotient (GQ).",
  },
  {
    id: "how",
    heading: "What you'll do each day.",
    sub: "Once per morning and once after your largest meal, record your temp and pulse. That's it. Seven days and your GQ emerges.",
  },
  {
    id: "units",
    heading: "Which temperature unit do you use?",
    sub: "All scoring runs in Celsius internally. Pick what's on your thermometer.",
  },
  {
    id: "ready",
    heading: "The dashboard is yours.",
    sub: "Lock in today's readings and your ascent is underway.",
  },
] as const;

type TempUnit = "F" | "C";

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [unit, setUnit] = useState<TempUnit>("F");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  async function finish() {
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Session expired. Please log in again.");
      }

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          temperature_unit: unit,      // ← FIXED: was temp_unit
          onboarding_complete: true,   // ← ADDED: mark complete
        },
        {
          onConflict: "id",
        }
      );

      if (upsertError) throw upsertError;

      router.push("/app");
    } catch (err: any) {
      setError(err.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "#1e2330",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#C9922A",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i <= step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i <= step ? "#C9922A" : "#1e2330",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#111827",
          border: "1px solid #1e2330",
          borderRadius: 14,
          padding: "48px 36px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 24 }}>
          {step === 0 && "🔥"}
          {step === 1 && "📈"}
          {step === 2 && "🌡️"}
          {step === 3 && "✅"}
        </div>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 26,
            fontWeight: 400,
            color: "#E8DCC8",
            marginBottom: 16,
            lineHeight: 1.3,
          }}
        >
          {current.heading}
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "#6B7280",
            lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          {current.sub}
        </p>

        {step === 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[
              {
                icon: "🌅",
                label: "Morning",
                sub: "Before eating or moving.",
              },
              {
                icon: "🍽️",
                label: "Post‑meal",
                sub: "45–60 min after main meal.",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  maxWidth: 160,
                  background: "#0d1117",
                  border: "1px solid #1e2330",
                  borderRadius: 10,
                  padding: "16px 12px",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {item.icon}
                </div>
                <div
                  style={{
                    color: "#E8DCC8",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    color: "#6B7280",
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            {(["F", "C"] as TempUnit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                style={{
                  width: 120,
                  padding: "16px 0",
                  background:
                    unit === u ? "rgba(201,146,42,0.12)" : "#0d1117",
                  border:
                    unit === u
                      ? "1px solid #C9922A"
                      : "1px solid #1e2330",
                  borderRadius: 10,
                  color: unit === u ? "#C9922A" : "#6B7280",
                  fontSize: 22,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {u}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 6,
              padding: "8px 12px",
              color: "#f87171",
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={isLast ? finish : () => setStep((s) => s + 1)}
          disabled={saving}
          style={{
            width: "100%",
            padding: "14px 0",
            background: saving ? "#8a6420" : "#C9922A",
            border: "none",
            borderRadius: 9,
            color: "#0d1117",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.04em",
            cursor: saving ? "not-allowed" : "pointer",
            textTransform: "uppercase",
          }}
        >
          {saving
            ? "Setting up your dashboard..."
            : isLast
            ? "Enter the Dashboard"
            : "Continue"}
        </button>

        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            style={{
              marginTop: 14,
              background: "none",
              border: "none",
              color: "#6B7280",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
