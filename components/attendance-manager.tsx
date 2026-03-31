"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ActivityRow = {
  id: string;
  nombre: string;
};

type PersonRow = {
  id: string;
  nombres: string;
  apellido_1: string;
  apellido_2: string | null;
};

type AttendanceRow = {
  id: string;
  dim_persona_id: string;
  estado: string;
};

export function AttendanceManager() {
  const supabase = useMemo(() => createClient(), []);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRow>>({});

  useEffect(() => {
    supabase
      .from("dim_actividades")
      .select("id, nombre")
      .order("fecha_inicio", { ascending: false })
      .limit(20)
      .then(({ data }) => setActivities((data ?? []) as ActivityRow[]));
  }, [supabase]);

  useEffect(() => {
    supabase
      .from("dim_personas")
      .select("id, nombres, apellido_1, apellido_2")
      .order("apellido_1", { ascending: true })
      .limit(30)
      .then(({ data }) => setPeople((data ?? []) as PersonRow[]));
  }, [supabase]);

  useEffect(() => {
    if (!selectedActivity) {
      setAttendance({});
      return;
    }

    supabase
      .from("fact_asistencia")
      .select("id, dim_persona_id, estado")
      .eq("actividad_id", selectedActivity)
      .then(({ data }) => {
        const map: Record<string, AttendanceRow> = {};
        ((data ?? []) as AttendanceRow[]).forEach((row) => {
          map[row.dim_persona_id] = row;
        });
        setAttendance(map);
      });
  }, [selectedActivity, supabase]);

  async function setStatus(personId: string, estado: string) {
    if (!selectedActivity) {
      return;
    }

    const existing = attendance[personId];
    const previous = attendance;
    const optimistic = {
      ...attendance,
      [personId]: {
        id: existing?.id ?? `temp-${personId}`,
        dim_persona_id: personId,
        estado
      }
    };

    setAttendance(optimistic);

    if (existing?.id && !existing.id.startsWith("temp-")) {
      const { data, error } = await supabase
        .from("fact_asistencia")
        .update({ estado })
        .eq("id", existing.id)
        .select("id, dim_persona_id, estado")
        .single();

      if (error) {
        setAttendance(previous);
        return;
      }

      setAttendance((current) => ({
        ...current,
        [personId]: data as AttendanceRow
      }));
      return;
    }

    const { data, error } = await supabase
      .from("fact_asistencia")
      .insert({
        actividad_id: selectedActivity,
        dim_persona_id: personId,
        estado
      })
      .select("id, dim_persona_id, estado")
      .single();

    if (error) {
      setAttendance(previous);
      return;
    }

    setAttendance((current) => ({
      ...current,
      [personId]: data as AttendanceRow
    }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Toma de Asistencia</h1>
        <p className="text-stone-600">Selecciona una actividad y marca rápidamente presente, ausente o atraso.</p>
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <select
          value={selectedActivity}
          onChange={(event) => setSelectedActivity(event.target.value)}
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        >
          <option value="">Selecciona una actividad</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.nombre}
            </option>
          ))}
        </select>
      </section>

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.6fr_1.8fr] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <span>Persona</span>
          <span>Registro</span>
        </div>
        {people.map((person) => {
          const fullName = [person.nombres, person.apellido_1, person.apellido_2].filter(Boolean).join(" ");
          const current = attendance[person.id]?.estado ?? "Sin marcar";

          return (
            <div key={person.id} className="grid grid-cols-[1.6fr_1.8fr] gap-4 border-t border-stone-200 px-6 py-4">
              <span className="font-semibold text-navy">{fullName}</span>
              <div className="flex flex-wrap items-center gap-2">
                {["Presente", "Ausente", "Atraso"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatus(person.id, status)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      current === status ? "bg-navy text-white" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {status}
                  </button>
                ))}
                <span className="text-xs text-stone-500">{current}</span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
