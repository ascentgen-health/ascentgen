// app/onboarding/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If already onboarded, skip straight to dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")   // ← correct column name
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_complete) {
    redirect("/app");
  }

  return <OnboardingClient userId={user.id} />;
}
