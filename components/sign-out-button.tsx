"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-navy transition hover:border-stone-300 hover:bg-stone-50"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesi&oacute;n
    </button>
  );
}
