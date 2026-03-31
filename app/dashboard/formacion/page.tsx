import { BarChart3, GraduationCap, Users } from "lucide-react";

import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { createClient } from "@/lib/supabase/server";

export default async function FormacionPage() {
  const supabase = await createClient();

  const [{ count: actividadesCount }, { count: asistenciaCount }, { count: sedesCount }] = await Promise.all([
    supabase.from("dim_actividades").select("*", { count: "exact", head: true }),
    supabase.from("fact_asistencia").select("*", { count: "exact", head: true }),
    supabase.from("sedes").select("*", { count: "exact", head: true }).eq("activa", true)
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Área Formación</h1>
        <p className="max-w-3xl text-base text-stone-600">
          Base visual para rutas formativas, sedes y seguimiento de participación.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCard
          label="Actividades"
          value={actividadesCount ?? 0}
          description="Actividades registradas en la dimensión de formación."
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Asistencias"
          value={asistenciaCount ?? 0}
          description="Hechos de asistencia cargados por el equipo."
          icon={<Users className="h-5 w-5" />}
          accent="forest"
        />
        <DashboardStatCard
          label="Sedes activas"
          value={sedesCount ?? 0}
          description="Sedes actualmente disponibles para operación."
          icon={<BarChart3 className="h-5 w-5" />}
          accent="amber"
        />
      </section>
    </div>
  );
}
