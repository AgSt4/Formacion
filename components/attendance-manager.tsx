"use client";

import { useEffect, useMemo, useState } from "react";

import { useAppSession } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ActivityRow = {
  id: string;
  nombre: string;
  fecha_inicio: string | null;
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

const STATES = ["Presente", "Ausente", "Atraso"] as const;

export function AttendanceManager() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { profile } = useAppSession();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRow>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBase() {
      setLoading(true);
      const [{ data: activityRows, error: activityError }, { data: peopleRows, error: peopleError }] = await Promise.all([
        supabase
          .from("dim_actividades")
          .select("id, nombre, fecha_inicio")
          .order("fecha_inicio", { ascending: false })
          .limit(30),
        supabase
          .from("dim_personas")
          .select("id, nombres, apellido_1, apellido_2")
          .order("apellido_1", { ascending: true })
          .limit(80)
      ]);

      if (activityError || peopleError) {
        setMessage(activityError?.message ?? peopleError?.message ?? "No fue posible cargar la asistencia.");
        setLoading(false);
        return;
      }

      const nextActivities = (activityRows ?? []) as ActivityRow[];
      setActivities(nextActivities);
      setPeople((peopleRows ?? []) as PersonRow[]);
      setSelectedActivity(nextActivities[0]?.id ?? "");
      setLoading(false);
    }

    loadBase();
  }, [supabase]);

  useEffect(() => {
    async function loadAttendance() {
      if (!selectedActivity) {
        setAttendance({});
        return;
      }

      const { data, error } = await supabase
        .from("fact_asistencia")
        .select("id, dim_persona_id, estado")
        .eq("actividad_id", selectedActivity);

      if (error) {
        setMessage(error.message);
        return;
      }

      const nextAttendance = (data ?? []).reduce<Record<string, AttendanceRow>>((acc, row) => {
        acc[row.dim_persona_id as string] = row as AttendanceRow;
        return acc;
      }, {});

      setAttendance(nextAttendance);
    }

    loadAttendance();
  }, [selectedActivity, supabase]);

  async function updateAttendance(personId: string, estado: (typeof STATES)[number]) {
    if (!selectedActivity) {
      setMessage("Selecciona una actividad antes de registrar asistencia.");
      return;
    }

    const previous = attendance;
    const existing = attendance[personId];
    setSavingId(personId);
    setMessage(null);
    setAttendance((current) => ({
      ...current,
      [personId]: {
        id: existing?.id ?? `temp-${personId}`,
        dim_persona_id: personId,
        estado
      }
    }));

    if (existing?.id && !existing.id.startsWith("temp-")) {
      const { data, error } = await supabase
        .from("fact_asistencia")
        .update({ estado, registrado_por: profile.id })
        .eq("id", existing.id)
        .select("id, dim_persona_id, estado")
        .single();

      if (error) {
        setAttendance(previous);
        setMessage(error.message);
        setSavingId(null);
        return;
      }

      setAttendance((current) => ({ ...current, [personId]: data as AttendanceRow }));
      setSavingId(null);
      return;
    }

    const { data, error } = await supabase
      .from("fact_asistencia")
      .insert({
        actividad_id: selectedActivity,
        dim_persona_id: personId,
        estado,
        registrado_por: profile.id
      })
      .select("id, dim_persona_id, estado")
      .single();

    if (error) {
      setAttendance(previous);
      setMessage(error.message);
      setSavingId(null);
      return;
    }

    setAttendance((current) => ({ ...current, [personId]: data as AttendanceRow }));
    setSavingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Asistencia rapida</h1>
        <p className="max-w-3xl text-base text-stone-600">
          Selecciona una actividad y registra estado con un clic. Pensado para usar desde notebook, celular o tablet.
        </p>
      </div>

      <section className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-card">
        <select
          value={selectedActivity}
          onChange={(event) => setSelectedActivity(event.target.value)}
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        >
          <option value="">Selecciona una actividad</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.nombre}
              {activity.fecha_inicio ? ` - ${activity.fecha_inicio}` : ""}
            </option>
          ))}
        </select>
      </section>

      {message ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">{message}</div>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-card">
        <div className="grid grid-cols-[1.6fr_1.8fr] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <span>Persona</span>
          <span>Registro</span>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-stone-500">Cargando base de asistencia...</div>
        ) : (
          people.map((person) => {
            const fullName = [person.nombres, person.apellido_1, person.apellido_2].filter(Boolean).join(" ");
            const currentState = attendance[person.id]?.estado ?? "Sin marcar";
            const isSaving = savingId === person.id;

            return (
              <div key={person.id} className="grid grid-cols-[1.6fr_1.8fr] gap-4 border-t border-stone-200 px-6 py-4">
                <span className="font-semibold text-navy">{fullName}</span>
                <div className="flex flex-wrap items-center gap-2">
                  {STATES.map((state) => {
                    const active = currentState === state;
                    const tone =
                      state === "Presente"
                        ? active
                          ? "bg-success text-white"
                          : "bg-success/10 text-success"
                        : state === "Ausente"
                          ? active
                            ? "bg-danger text-white"
                            : "bg-danger/10 text-danger"
                          : active
                            ? "bg-warning text-white"
                            : "bg-warning/10 text-warning";

                    return (
                      <button
                        key={state}
                        type="button"
                        onClick={() => updateAttendance(person.id, state)}
                        disabled={isSaving}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${tone} disabled:opacity-60`}
                      >
                        {state}
                      </button>
                    );
                  })}
                  <span className="text-xs text-stone-500">{isSaving ? "Guardando..." : currentState}</span>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
