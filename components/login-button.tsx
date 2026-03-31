"use client";

import { useState } from "react";
import { Chrome, LoaderCircle, LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);

    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard/personas`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account"
        }
      }
    });

    if (error) {
      setIsLoading(false);
      console.error(error.message);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={isLoading}
      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-navy px-5 py-3 text-base font-semibold text-white transition hover:bg-[#16213A] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
      Ingresar con correo corporativo
      <LogIn className="h-4 w-4" />
    </button>
  );
}
