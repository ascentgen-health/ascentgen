// app/app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveDailyEntry(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Hard guard — never fall through with a fake UUID
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const date = new Date().toISOString().slice(0, 10);

  const parseNumber = (value: FormDataEntryValue | null) => {
    if (value == null) return null;
    const str = value.toString().trim();
    if (!str) return null;
    const num = Number(str);
    return Number.isNaN(num) ? null : num;
  };

  const wakingTemp = parseNumber(formData.get("waking_temp_value"));
  const wakingPulse = parseNumber(formData.get("waking_pulse_bpm"));
  const postMealTemp = parseNumber(formData.get("post_meal_temp_value"));
  const postMealPulse = parseNumber(formData.get("post_meal_pulse_bpm"));

  const row = {
    user_id: user.id,           // ← correct column name
    date,
    waking_temp_value: wakingTemp,
    waking_temp_unit: wakingTemp == null ? null : "F",
    waking_pulse_bpm: wakingPulse,
    post_meal_temp_value: postMealTemp,
    post_meal_temp_unit: postMealTemp == null ? null : "F",
    post_meal_pulse_bpm: postMealPulse,
  };

  const { error } = await supabase
    .from("daily_entries")           // ← correct table name
    .upsert(row, { onConflict: "user_id,date" });

  if (error) {
    console.error("Error saving daily entry", error);
    throw new Error("Failed to save");
  }

  revalidatePath("/app");
}
