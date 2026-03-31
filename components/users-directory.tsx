"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type UserRow = {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  activo: boolean | null;
};

export function UsersDirectory() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("perfiles_usuarios")
      .select("id, email, nombre_completo, rol, activo")
      .order("nombre_completo", { ascending: true })
      .then(({ data }) => {
        setRows((data ?? []) as UserRow[]);
        setLoading(false);
      });
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Usuarios</h1>
        <p className="text-stone-600">Vista simple para verificar perfiles, roles y activación.</p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.6fr_1.2fr_0.8fr_0.8fr] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <span>Nombre</span>
          <span>Email</span>
          <span>Rol</span>
          <span>Estado</span>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-sm text-stone-500">Cargando usuarios...</div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.6fr_1.2fr_0.8fr_0.8fr] gap-4 border-t border-stone-200 px-6 py-4 text-sm"
            >
              <span className="font-semibold text-navy">{row.nombre_completo}</span>
              <span className="truncate">{row.email}</span>
              <span>{row.rol}</span>
              <span>{row.activo ? "Activo" : "Inactivo"}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
