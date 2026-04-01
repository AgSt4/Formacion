"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";

function parseHashTokens(hash: string) {
  const normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalized);

  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    error: params.get("error_description") ?? params.get("error")
  };
}

export default function AuthCompletePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Validando acceso...");

  useEffect(() => {
    async function finishAuth() {
      if (!hasSupabaseEnv()) {
        setMessage("Faltan variables publicas de Supabase.");
        return;
      }

      const { accessToken, refreshToken, error } = parseHashTokens(window.location.hash);

      if (error) {
        router.replace(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!accessToken || !refreshToken) {
        router.replace("/login?error=No se recibieron tokens desde Google y Supabase.");
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError) {
        router.replace(`/login?error=${encodeURIComponent(sessionError.message)}`);
        return;
      }

      window.history.replaceState({}, document.title, window.location.pathname);
      setMessage("Sesion iniciada. Redirigiendo...");
      router.replace("/dashboard");
      router.refresh();
    }

    finishAuth();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 shadow-card">
        <h1 className="font-heading text-3xl text-navy">Acceso IdeaPais</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">{message}</p>
      </div>
    </main>
  );
}
