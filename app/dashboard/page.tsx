import { AlertTriangle, Database, Users } from "lucide-react";

import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: personasCount }, { count: perfilesCount }, { count: pendientesCount }] = await Promise.all([
    supabase.from("dim_personas").select("*", { count: "exact", head: true }),
    supabase.from("perfiles_usuarios").select("*", { count: "exact", head: true }),
    supabase.from("personas_raw").select("*", { count: "exact", head: true }).eq("procesado", false)
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Resumen institucional</h1>
        <p className="max-w-3xl text-base text-stone-600">
          Vista inicial del sistema de inteligencia institucional, alineada al modelo Golden Record y a los perfiles de
          acceso.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCard
          label="Golden Records"
          value={personasCount ?? 0}
          description="Personas consolidadas en la dimensión maestra."
          icon={<Database className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Usuarios activos"
          value={perfilesCount ?? 0}
          description="Perfiles institucionales gestionados desde Supabase."
          icon={<Users className="h-5 w-5" />}
          accent="forest"
        />
        <DashboardStatCard
          label="Pendientes de revisión"
          value={pendientesCount ?? 0}
          description="Entradas de personas_raw que requieren validación administrativa."
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="amber"
        />
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-2xl text-navy">Criterio operativo</h2>
        <p className="mt-3 max-w-3xl leading-7 text-stone-600">
          Esta versión privilegia estabilidad, acceso seguro y lectura clara del modelo de datos. Los módulos de
          Formación, Desarrollo y Estudios quedan visibles según el área y el rol del usuario autenticado.
        </p>
      </section>
    </div>
  );
}
