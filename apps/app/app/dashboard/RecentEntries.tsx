"use client";

import { createClient } from "@/lib/supabase/browser";

type Entry = {
  id: string;
  date: string;
  waking_temp_value: number | null;
  waking_temp_unit: string | null;
  waking_pulse_bpm: number | null;
  post_meal_temp_value: number | null;
  post_meal_temp_unit: string | null;
  post_meal_pulse_bpm: number | null;
};

type Props = {
  entries: Entry[];
  onDelete: (id: string) => void;
};

export default function RecentEntries({ entries, onDelete }: Props) {
  const supabase = createClient();

  async function handleDelete(id: string) {
    const { error } = await supabase.from("daily_entries").delete().eq("id", id);
    if (!error) onDelete(id);
    else alert("Delete failed. Try again.");
  }

  if (!entries.length) return <p style={{ color: "#999", fontSize: 14 }}>No entries yet — log your first reading above.</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #eee" }}>
            {["Date","Wake Temp","Wake Pulse","PM Temp","PM Pulse",""].map(h => (
              <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "#888", fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "8px 10px" }}>{e.date}</td>
              <td style={{ padding: "8px 10px" }}>{e.waking_temp_value != null ? `${e.waking_temp_value}°${e.waking_temp_unit}` : "—"}</td>
              <td style={{ padding: "8px 10px" }}>{e.waking_pulse_bpm != null ? `${e.waking_pulse_bpm} bpm` : "—"}</td>
              <td style={{ padding: "8px 10px" }}>{e.post_meal_temp_value != null ? `${e.post_meal_temp_value}°${e.post_meal_temp_unit}` : "—"}</td>
              <td style={{ padding: "8px 10px" }}>{e.post_meal_pulse_bpm != null ? `${e.post_meal_pulse_bpm} bpm` : "—"}</td>
              <td style={{ padding: "8px 10px" }}>
                <button onClick={() => handleDelete(e.id)} style={{ color: "#c00", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}