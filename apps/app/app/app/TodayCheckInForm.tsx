"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Entry = {
  id: string;
  user_id: string;
  date: string;
  waking_temp_value: number | null;
  waking_temp_unit: string | null;
  waking_pulse_bpm: number | null;
  post_meal_temp_value: number | null;
  post_meal_temp_unit: string | null;
  post_meal_pulse_bpm: number | null;
  notes: string | null;
};

type Props = {
  userId: string;
  defaultUnit: "C" | "F";
  existingEntry: Entry | null;
  onSaved: () => void;
};

export default function TodayCheckInForm({ userId, defaultUnit, existingEntry, onSaved }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [wakingTemp, setWakingTemp] = useState(existingEntry?.waking_temp_value?.toString() ?? "");
  const [wakingPulse, setWakingPulse] = useState(existingEntry?.waking_pulse_bpm?.toString() ?? "");
  const [postTemp, setPostTemp] = useState(existingEntry?.post_meal_temp_value?.toString() ?? "");
  const [postPulse, setPostPulse] = useState(existingEntry?.post_meal_pulse_bpm?.toString() ?? "");
  const [notes, setNotes] = useState(existingEntry?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!wakingTemp && !wakingPulse && !postTemp && !postPulse) {
      setError("Enter at least one measurement.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: err } = await supabase.from("daily_entries").upsert(
      {
        user_id: userId,
        date: todayStr,
        waking_temp_value: wakingTemp ? parseFloat(wakingTemp) : null,
        waking_temp_unit: defaultUnit,
        waking_pulse_bpm: wakingPulse ? parseInt(wakingPulse) : null,
        post_meal_temp_value: postTemp ? parseFloat(postTemp) : null,
        post_meal_temp_unit: defaultUnit,
        post_meal_pulse_bpm: postPulse ? parseInt(postPulse) : null,
        notes: notes || null,
      },
      { onConflict: "user_id,date" }
    );

    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onSaved();
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #1e2330",
    borderRadius: 8,
    fontSize: 15,
    background: "#111827",
    color: "#E8DCC8",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  };

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e2330",
        borderRadius: 12,
        padding: "24px",
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 16,
          color: "#E8DCC8",
          marginBottom: 20,
        }}
      >
        Today's Reading
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Waking Temp</label>
          <input
            type="number"
            value={wakingTemp}
            onChange={e => setWakingTemp(e.target.value)}
            placeholder={defaultUnit === "F" ? "97.8" : "36.5"}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Waking Pulse</label>
          <input
            type="number"
            value={wakingPulse}
            onChange={e => setWakingPulse(e.target.value)}
            placeholder="62"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Post-Meal Temp</label>
          <input
            type="number"
            value={postTemp}
            onChange={e => setPostTemp(e.target.value)}
            placeholder={defaultUnit === "F" ? "98.6" : "37.0"}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Post-Meal Pulse</label>
          <input
            type="number"
            value={postPulse}
            onChange={e => setPostPulse(e.target.value)}
            placeholder="78"
            style={inputStyle}
          />
        </div>
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        style={{
          ...inputStyle,
          resize: "vertical",
          marginBottom: 16,
          fontFamily: "inherit",
        }}
      />

      {error && (
        <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "12px 28px",
          background: saved ? "#7AAE7A" : "#C9922A",
          color: "#0d1117",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: saving ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saved ? "Saved ✓" : saving ? "Saving…" : "Lock in readings"}
      </button>
    </div>
  );
}