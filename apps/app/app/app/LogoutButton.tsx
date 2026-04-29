"use client";
// app/app/LogoutButton.tsx
// Uses browser client (sync) — no await on createClient()
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient(); // ← sync, no await
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "none",
        border: "1px solid #272738",
        borderRadius: "4px",
        color: "#6B7280",
        fontSize: "11px",
        letterSpacing: "0.08em",
        padding: "5px 10px",
        cursor: "pointer",
        textTransform: "uppercase",
      }}
    >
      Sign out
    </button>
  );
}
