import { Building2 } from "lucide-react";

import { LoginRedirectGate } from "@/components/login-redirect-gate";
import { LoginButton } from "@/components/login-button";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <LoginRedirectGate />
      <section className="w-full max-w-xl rounded-[32px] border border-stone-200 bg-white p-8 shadow-card lg:p-10">
        <div className="mb-10 flex items-center gap-3 text-navy">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-2xl leading-none">IdeaPais</p>
            <p className="text-sm text-stone-500">Plataforma interna</p>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="font-heading text-4xl text-navy">Acceso institucional</h1>
          <p className="max-w-lg text-base leading-7 text-stone-600">
            Base minima para un backoffice robusto: Google OAuth simple, sesion persistente y validacion explicita en
            <code> perfiles_usuarios</code>.
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8">
          <LoginButton />
        </div>

        <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-600">
          Si Google abre bien pero tu perfil no esta activo, veras una pantalla clara de acceso pendiente en lugar de
          un rebote silencioso.
        </div>
      </section>
    </main>
  );
}
