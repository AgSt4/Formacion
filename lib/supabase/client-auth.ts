"use client";

type MinimalSupabaseClient = {
  auth: {
    setSession: (session: { access_token: string; refresh_token: string }) => Promise<unknown>;
  };
};

export async function hydrateSessionFromHash(supabase: MinimalSupabaseClient) {
  if (typeof window === "undefined") {
    return false;
  }

  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;

  if (!hash) {
    return false;
  }

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return false;
  }

  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, document.title, cleanUrl);
  return true;
}
