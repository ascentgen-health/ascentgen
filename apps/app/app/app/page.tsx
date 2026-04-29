// app/app/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeGQ } from "@/lib/gq";
import DashboardClient from "./DashboardClient";
import { LogoutButton } from "@/app/_components/LogoutButton";

export default async function AppPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load profile — column is temperature_unit (not temp_unit)
  const { data: profile } = await supabase
    .from("profiles")
    .select("temperature_unit, onboarding_complete")
    .eq("id", user.id)
    .single();

  // If no profile row at all, go to onboarding
  if (!profile || !profile.onboarding_complete) redirect("/onboarding");

  const unit = (profile.temperature_unit ?? "F") as "F" | "C";

  // Load last 90 days — table is daily_entries, FK column is user_id
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: entries } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", ninetyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  const allEntries = entries ?? [];

  // Today's entry
  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry =
    allEntries.find((e: any) => e.date === todayStr) ?? null;

  // GQ uses last 14 entries
  const gqResult = computeGQ(allEntries, 14);

  // Streak
  function computeStreak(): number {
    if (allEntries.length === 0) return 0;
    const dates = new Set(allEntries.map((e: any) => e.date));
    let streak = 0;
    const d = new Date();
    if (!dates.has(d.toISOString().split("T")[0])) {
      d.setDate(d.getDate() - 1);
    }
    while (true) {
      const ds = d.toISOString().split("T")[0];
      if (dates.has(ds)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  const streak = computeStreak();
  const totalEntries = allEntries.length;
  const daysUntilGQ = Math.max(0, 7 - totalEntries);

  return (
    <div className="min-h-screen bg-[#06070E] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
          Ascentgen
        </span>
        <LogoutButton />
      </header>

      <main className="px-4 py-6">
        <DashboardClient
          userId={user.id}
          unit={unit}
          todayEntry={todayEntry}
          entries={allEntries.slice(-14).reverse()}
          gqResult={gqResult}
          streak={streak}
          totalEntries={totalEntries}
          daysUntilGQ={daysUntilGQ}
          todayStr={todayStr}
        />
      </main>
    </div>
  );
}