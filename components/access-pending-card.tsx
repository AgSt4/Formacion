import { MailWarning } from "lucide-react";

import { SignOutButton } from "@/components/sign-out-button";

type AccessPendingCardProps = {
  email: string;
};

export function AccessPendingCard({ email }: AccessPendingCardProps) {
  return (
    <section className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 shadow-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning">
        <MailWarning className="h-6 w-6" />
      </div>

      <h1 className="mt-6 font-heading text-4xl text-navy">Acceso pendiente</h1>
      <p className="mt-4 text-base leading-7 text-stone-600">
        Iniciaste sesion correctamente con <strong>{email}</strong>, pero todavia no existe un perfil activo en
        <code> perfiles_usuarios</code>.
      </p>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
        Un administrador debe revisar tu alta, activar la fila correspondiente y asignar <code>rol</code>,
        <code>area_id</code> y <code>sede_id</code> cuando corresponda.
      </div>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </section>
  );
}
