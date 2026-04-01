"use client";

import { Search, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [term, setTerm] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      let request = supabase
        .from("dim_personas")
        .select("id, rut, email, nombres, apellido_1, apellido_2, estado_fidelizacion")
        .order("apellido_1", { ascending: true })
        .limit(80);

      if (search.trim()) {
        const safeTerm = search.trim().replace(/[%_]/g, "");
        request = request.ilike("apellido_1", `%${safeTerm}%`);
      }

      const { data, error: peopleError } = await request;

      if (peopleError) {
        setError(peopleError.message);
        setPersonas([]);
        setPendingCounts({});
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as PersonaRow[];
      setPersonas(rows);

      if (!rows.length) {
        setPendingCounts({});
        setLoading(false);
        return;
      }

      const { data: rawRows, error: rawError } = await supabase
        .from("personas_raw")
        .select("dim_persona_id")
        .in(
          "dim_persona_id",
          rows.map((row) => row.id)
        )
        .eq("procesado", false);

      if (rawError) {
        setError(rawError.message);
        setPendingCounts({});
        setLoading(false);
        return;
      }

      const counts = (rawRows ?? []).reduce<Record<string, number>>((acc, row) => {
        const personaId = row.dim_persona_id as string | null;
        if (!personaId) {
          return acc;
        }
        acc[personaId] = (acc[personaId] ?? 0) + 1;
        return acc;
      }, {});

      setPendingCounts(counts);
      setLoading(false);
    }

    load();
  }, [search, supabase]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Directorio de personas</h1>
        <p className="max-w-3xl text-base text-stone-600">
          Vista base del golden record institucional con busqueda por apellido y alerta de datos crudos pendientes.
        </p>
      </div>

      <section className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-card">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(term);
          }}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <label className="flex flex-1 items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
            <Search className="h-4 w-4 text-stone-500" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar por apellido..."
              className="w-full bg-transparent outline-none placeholder:text-stone-400"
            />
          </label>
          <button
            type="submit"
            className="rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#16213A]"
          >
            Buscar
          </button>
        </form>
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">{error}</div>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-card">
        <div className="grid grid-cols-[2fr_1fr_1.3fr_1fr] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
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
            const pendingCount = pendingCounts[persona.id] ?? 0;

            return (
              <div
                key={persona.id}
                className="grid grid-cols-[2fr_1fr_1.3fr_1fr] gap-4 border-t border-stone-200 px-6 py-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy">{fullName}</span>
                    {pendingCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Nuevos datos crudos ({pendingCount})
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
