"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AccessPendingCard } from "@/components/access-pending-card";
import { Sidebar } from "@/components/sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import type { ProfileRecord, SessionUser } from "@/lib/types";

type AppSessionContextValue = {
  profile: ProfileRecord;
  user: SessionUser;
};

const AppSessionContext = createContext<AppSessionContextValue | null>(null);

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [envError, setEnvError] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setEnvError("Faltan variables publicas de Supabase. Configura Vercel antes de probar el login.");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    async function bootstrap() {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser({ id: currentUser.id, email: currentUser.email ?? null });

      const { data, error } = await supabase
        .from("perfiles_usuarios")
        .select("id, email, nombre_completo, rol, activo, area_id, sede_id, area:areas(id, nombre), sede:sedes(id, nombre)")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        setEnvError(error.message);
      }

      setProfile((data as ProfileRecord | null) ?? null);
      setLoading(false);
    }

    bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const contextValue = useMemo(() => {
    if (!user || !profile) {
      return null;
    }

    return {
      user,
      profile
    };
  }, [profile, user]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="rounded-3xl border border-stone-200 bg-white px-6 py-5 text-sm text-stone-600 shadow-card">
          Cargando sesion...
        </div>
      </main>
    );
  }

  if (envError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-card">
          <h1 className="font-heading text-3xl text-navy">Configuracion incompleta</h1>
          <p className="mt-4 text-sm leading-7 text-stone-600">{envError}</p>
        </div>
      </main>
    );
  }

  if (!profile?.activo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
        <AccessPendingCard email={user?.email ?? ""} />
      </main>
    );
  }

  if (!contextValue) {
    return null;
  }

  return (
    <AppSessionContext.Provider value={contextValue}>
      <div className="min-h-screen bg-cream text-ink">
        <div className="grid min-h-screen app-shell-grid">
          <Sidebar profile={profile} />
          <div className="min-w-0 px-6 py-6 lg:px-10 lg:py-8">
            <div className="mb-6 flex justify-end">
              <SignOutButton />
            </div>
            {children}
          </div>
        </div>
      </div>
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  const value = useContext(AppSessionContext);

  if (!value) {
    throw new Error("useAppSession debe usarse dentro de AppShell.");
  }

  return value;
}
