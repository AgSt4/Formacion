"use client";

type MinimalSupabaseClient = {
  auth: {
    exchangeCodeForSession: (code: string) => Promise<unknown>;
    setSession: (session: { access_token: string; refresh_token: string }) => Promise<unknown>;
  };
};

export async function hydrateSessionFromUrl(supabase: MinimalSupabaseClient) {
  if (typeof window === "undefined") {
    return false;
  }

  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    url.searchParams.delete("code");
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    return true;
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

  window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
  return true;
}
