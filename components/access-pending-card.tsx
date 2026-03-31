import { MailWarning } from "lucide-react";

import { SignOutButton } from "@/components/sign-out-button";

type AccessPendingCardProps = {
  email: string;
};

export function AccessPendingCard({ email }: AccessPendingCardProps) {
  return (
    <section className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 shadow-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10 text-amber">
        <MailWarning className="h-6 w-6" />
      </div>

      <h1 className="mt-6 font-heading text-4xl text-navy">Cuenta pendiente de habilitación</h1>
      <p className="mt-4 text-base leading-7 text-stone-600">
        Iniciaste sesión correctamente con <strong>{email}</strong>, pero todavía no existe un perfil activo en
        <code> perfiles_usuarios</code>. Un administrador puede asignarte el rol <code>usuario</code>,{" "}
        <code>encargado</code> o <code>admin</code> sin que la plataforma se caiga.
      </p>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        Siguiente paso sugerido: revisar en Supabase la tabla <code>perfiles_usuarios</code> y actualizar tu rol o
        estado.
      </div>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </section>
  );
}
