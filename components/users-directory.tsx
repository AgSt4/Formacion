"use client";

import { useEffect, useMemo, useState } from "react";

import { useAppSession } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type UserRow = {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  activo: boolean | null;
  area?: {
    nombre: string;
  } | null;
  sede?: {
    nombre: string;
  } | null;
};

export function UsersDirectory() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { profile } = useAppSession();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      const { data, error: userError } = await supabase
        .from("perfiles_usuarios")
        .select("id, email, nombre_completo, rol, activo, area:areas(nombre), sede:sedes(nombre)")
        .order("nombre_completo", { ascending: true });

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      setRows((data ?? []) as UserRow[]);
      setLoading(false);
    }

    if (profile.rol === "admin") {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [profile.rol, supabase]);

  if (profile.rol !== "admin") {
    return (
      <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-card">
        <h1 className="font-heading text-3xl text-navy">Usuarios</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Esta vista queda reservada para administradores en la primera fase.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Usuarios y perfiles</h1>
        <p className="text-stone-600">Validacion basica de roles, area, sede y estado de activacion.</p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">{error}</div>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-card">
        <div className="grid grid-cols-[1.6fr_1.3fr_0.8fr_0.9fr_0.8fr] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <span>Nombre</span>
          <span>Email</span>
          <span>Rol</span>
          <span>Area / Sede</span>
          <span>Estado</span>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-sm text-stone-500">Cargando usuarios...</div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.6fr_1.3fr_0.8fr_0.9fr_0.8fr] gap-4 border-t border-stone-200 px-6 py-4 text-sm"
            >
              <span className="font-semibold text-navy">{row.nombre_completo}</span>
              <span className="truncate">{row.email}</span>
              <span>{row.rol}</span>
              <span>{[row.area?.nombre, row.sede?.nombre].filter(Boolean).join(" / ") || "Sin asignar"}</span>
              <span>{row.activo ? "Activo" : "Inactivo"}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
