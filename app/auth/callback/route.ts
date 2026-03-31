import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard/personas";
  const redirectResponse = NextResponse.redirect(new URL(next, url.origin));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  if (code) {
    const requestCookies = new Headers(request.headers).get("cookie") ?? "";

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return requestCookies
            .split(/; */)
            .filter(Boolean)
            .map((cookie) => {
              const [name, ...valueParts] = cookie.split("=");
              return {
                name,
                value: decodeURIComponent(valueParts.join("="))
              };
            });
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        }
      }
    });

    await supabase.auth.exchangeCodeForSession(code);
  }

  return redirectResponse;
}
