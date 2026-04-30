"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        fontSize: 12,
        color: "rgba(255,255,255,0.4)",
        background: "none",
        border: "none",
        cursor: "pointer",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      Sign out
    </button>
  );
}