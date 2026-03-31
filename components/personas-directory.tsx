"use client";

import { Search, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type PersonaRow = {
  id: string;
  rut: string | null;
  email: string | null;
  nombres: string;
  apellido_1: string;
  apellido_2: string | null;
  estado_fidelizacion: string | null;
};

export function PersonasDirectory() {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      let request = supabase
        .from("dim_personas")
        .select("id, rut, email, nombres, apellido_1, apellido_2, estado_fidelizacion")
        .order("apellido_1", { ascending: true })
        .limit(50);

      if (query.trim()) {
        const term = query.trim().replace(/[%_]/g, "");
        request = request.or(
          `nombres.ilike.%${term}%,apellido_1.ilike.%${term}%,apellido_2.ilike.%${term}%,email.ilike.%${term}%`
        );
      }

      const { data, error: personasError } = await request;

      if (personasError) {
        setError(personasError.message);
        setPersonas([]);
        setPendingIds(new Set());
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as PersonaRow[];
      setPersonas(rows);

      if (!rows.length) {
        setPendingIds(new Set());
        setLoading(false);
        return;
      }

      const { data: pendingRows } = await supabase
        .from("personas_raw")
        .select("dim_persona_id")
        .in(
          "dim_persona_id",
          rows.map((row) => row.id)
        )
        .eq("procesado", false);

      setPendingIds(new Set((pendingRows ?? []).map((row) => row.dim_persona_id).filter(Boolean)));
      setLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, supabase]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Directorio de Identidades</h1>
        <p className="text-stone-600">Buscador operativo de personas consolidadas y entradas pendientes de revisión.</p>
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
          <Search className="h-4 w-4 text-stone-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, apellido o correo..."
            className="w-full bg-transparent outline-none placeholder:text-stone-400"
          />
        </label>
      </section>

      {error ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">{error}</div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1.3fr_0.9fr] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <span>Nombre</span>
          <span>RUT</span>
          <span>Email</span>
          <span>Estado</span>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-stone-500">Cargando directorio...</div>
        ) : personas.length === 0 ? (
          <div className="px-6 py-10 text-sm text-stone-500">No se encontraron personas.</div>
        ) : (
          personas.map((persona) => {
            const fullName = [persona.nombres, persona.apellido_1, persona.apellido_2].filter(Boolean).join(" ");
            const pending = pendingIds.has(persona.id);

            return (
              <div
                key={persona.id}
                className="grid grid-cols-[2fr_1fr_1.3fr_0.9fr] gap-4 border-t border-stone-200 px-6 py-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy">{fullName}</span>
                    {pending ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 px-3 py-1 text-xs font-semibold text-amber">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Revisión
                      </span>
                    ) : null}
                  </div>
                </div>
                <span>{persona.rut ?? "Sin RUT"}</span>
                <span className="truncate">{persona.email ?? "Sin email"}</span>
                <span>{persona.estado_fidelizacion ?? "Sin estado"}</span>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
