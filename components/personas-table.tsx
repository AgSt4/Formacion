import { AlertCircle, Mail, ShieldCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type PersonaRecord = {
  id: string;
  rut: string | null;
  email: string | null;
  nombres: string | null;
  apellido_1: string | null;
  apellido_2: string | null;
  estado_fidelizacion: string | null;
};

type PendingRawRecord = {
  dim_persona_id: string | null;
};

type PersonasTableProps = {
  query: string;
};

function buildFullName(persona: PersonaRecord) {
  return [persona.nombres, persona.apellido_1, persona.apellido_2].filter(Boolean).join(" ");
}

function EstadoBadge({ estado }: { estado: string | null }) {
  const label = estado?.trim() || "Sin estado";
  const tone =
    label.toLowerCase() === "activo"
      ? "bg-forest/10 text-forest"
      : "bg-stone-100 text-stone-600";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

export async function PersonasTable({ query }: PersonasTableProps) {
  const supabase = await createClient();

  let personasQuery = supabase
    .from("dim_personas")
    .select("id, rut, email, nombres, apellido_1, apellido_2, estado_fidelizacion")
    .order("apellido_1", { ascending: true })
    .order("apellido_2", { ascending: true })
    .order("nombres", { ascending: true })
    .limit(50);

  if (query) {
    const escaped = query.replace(/[%_]/g, "");
    personasQuery = personasQuery.or(
      `nombres.ilike.%${escaped}%,apellido_1.ilike.%${escaped}%,apellido_2.ilike.%${escaped}%`
    );
  }

  const { data, error } = await personasQuery;
  const personas = (data ?? []) as PersonaRecord[];

  if (error) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-semibold">No fue posible cargar el directorio.</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const ids = personas?.map((persona) => persona.id) ?? [];
  const pendingReview = new Set<string>();

  if (ids.length > 0) {
    const { data: pendingData } = await supabase
      .from("personas_raw")
      .select("dim_persona_id")
      .in("dim_persona_id", ids)
      .eq("procesado", false);

    const pendingRows = (pendingData ?? []) as PendingRawRecord[];

    pendingRows?.forEach((row) => {
      if (row.dim_persona_id) {
        pendingReview.add(row.dim_persona_id);
      }
    });
  }

  if (!personas || personas.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center shadow-sm">
        <p className="font-heading text-2xl text-navy">No se encontraron personas</p>
        <p className="mt-2 text-stone-500">
          Ajusta la b&uacute;squeda o revisa si la tabla `dim_personas` ya tiene registros.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="grid grid-cols-[2.2fr_1fr_1.4fr_0.8fr] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        <span>Nombre Completo</span>
        <span>RUT</span>
        <span>Email</span>
        <span>Estado</span>
      </div>

      {personas.map((persona) => {
        const fullName = buildFullName(persona) || "Sin nombre";
        const needsReview = pendingReview.has(persona.id);

        return (
          <div
            key={persona.id}
            className="grid grid-cols-[2.2fr_1fr_1.4fr_0.8fr] gap-4 border-t border-stone-200 px-6 py-4 text-sm"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-navy">{fullName}</p>
                {needsReview ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber/10 px-3 py-1 text-xs font-semibold text-amber">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber animate-pulse-ring" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber" />
                    </span>
                    Requiere revisi&oacute;n
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Consolidado
                  </span>
                )}
              </div>
            </div>

            <span className="text-stone-700">{persona.rut ?? "Sin RUT"}</span>

            <span className="flex items-center gap-2 truncate text-stone-700">
              <Mail className="h-4 w-4 shrink-0 text-stone-400" />
              <span className="truncate">{persona.email ?? "Sin email"}</span>
            </span>

            <EstadoBadge estado={persona.estado_fidelizacion} />
          </div>
        );
      })}
    </div>
  );
}
