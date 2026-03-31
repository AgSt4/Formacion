import { ShieldAlert, Users2 } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyStateCard } from "@/components/empty-state-card";
import { canManageUsers, getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type UserRow = {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  activo: boolean | null;
};

export default async function UsuariosPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  if (!canManageUsers(profile.rol)) {
    return (
      <EmptyStateCard
        title="Administración restringida"
        description="Solo el rol admin puede gestionar perfiles y revisar la tabla perfiles_usuarios."
        icon={<ShieldAlert className="h-6 w-6" />}
      />
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("perfiles_usuarios")
    .select("id, email, nombre_completo, rol, activo")
    .order("nombre_completo", { ascending: true });

  const rows = (data ?? []) as UserRow[];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Usuarios y roles</h1>
        <p className="max-w-3xl text-base text-stone-600">
          Vista administrativa de <code>perfiles_usuarios</code> para validar correo, activación y jerarquía.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.5fr_1.1fr_0.8fr_0.8fr] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <span>Usuario</span>
          <span>Email</span>
          <span>Rol</span>
          <span>Estado</span>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-12">
            <EmptyStateCard
              title="Sin perfiles"
              description="Todavía no hay filas en perfiles_usuarios."
              icon={<Users2 className="h-6 w-6" />}
            />
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.5fr_1.1fr_0.8fr_0.8fr] gap-4 border-t border-stone-200 px-6 py-4 text-sm"
            >
              <div>
                <p className="font-semibold text-navy">{row.nombre_completo}</p>
                <p className="text-xs text-stone-500">{row.id}</p>
              </div>
              <span className="truncate text-stone-700">{row.email}</span>
              <span className="text-stone-700">{row.rol}</span>
              <span className={row.activo ? "text-forest" : "text-amber"}>{row.activo ? "Activo" : "Inactivo"}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
