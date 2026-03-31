"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { hydrateSessionFromUrl } from "@/lib/supabase/client-auth";
import { createClient } from "@/lib/supabase/client";

export function LoginRedirectGate() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    hydrateSessionFromUrl(supabase)
      .catch(() => false)
      .then(() => supabase.auth.getSession())
      .then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard/personas");
        router.refresh();
      }
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        router.replace("/dashboard/personas");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
