"use client";

import { useState } from "react";
import { Chrome, LoaderCircle, LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();
    const origin = window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        skipBrowserRedirect: true,
        redirectTo: `${origin}/auth/callback?next=/dashboard/personas`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account"
        }
      }
    });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
      return;
    }

    if (!data?.url) {
      setIsLoading(false);
      setErrorMessage("Supabase no devolvió una URL de autenticación.");
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <div className="space-y-3">
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

      {errorMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
