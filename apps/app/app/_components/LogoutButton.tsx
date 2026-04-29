"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-md border border-white/20 px-3 py-1.5 text-xs tracking-[0.16em] uppercase text-white/70 hover:bg-white/5 disabled:opacity-60"
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}