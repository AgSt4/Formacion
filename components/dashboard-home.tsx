"use client";

import Link from "next/link";
import { ArrowRight, BookUser, ClipboardCheck, KanbanSquare, Users } from "lucide-react";

import { useAppSession } from "@/components/app-shell";

type DashboardHomeProps = {
  section?: "formacion";
};

export function DashboardHome({ section }: DashboardHomeProps) {
  const { profile } = useAppSession();

  if (section === "formacion") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl text-navy">Formacion</h1>
          <p className="max-w-3xl text-base text-stone-600">
            Base minima para asistencia rapida y visualizacion de rutas formativas.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          {[
            {
              href: "/dashboard/formacion/asistencia",
              title: "Asistencia rapida",
              description: "Selecciona actividad y registra presente, ausente o atraso al instante.",
              icon: ClipboardCheck
            },
            {
              href: "/dashboard/formacion/rutas/base",
              title: "Rutas formativas",
              description: "Tablero simple tipo Kanban para mover personas por etapa.",
              icon: KanbanSquare
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy/5 text-navy">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-heading text-2xl text-navy">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                  Abrir
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </section>
      </div>
    );
  }

  const cards = [
    {
      href: "/dashboard/personas",
      title: "Directorio de personas",
      description: "Golden record, revisiones crudas y busqueda rapida por apellido.",
      icon: BookUser
    },
    {
      href: "/dashboard/formacion",
      title: "Modulo de formacion",
      description: "Asistencia rapida y rutas tipo Kanban para el funnel formativo.",
      icon: ClipboardCheck
    },
    {
      href: "/dashboard/usuarios",
      title: "Perfiles de acceso",
      description: "Roles, area, sede y habilitacion de usuarios internos.",
      icon: Users,
      hidden: profile.rol !== "admin"
    }
  ].filter((card) => !card.hidden);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Primera fase estable</p>
        <h1 className="font-heading text-5xl text-navy">Backoffice IdeaPais</h1>
        <p className="max-w-3xl text-base leading-7 text-stone-600">
          Base operativa enfocada en estabilidad del acceso, trazabilidad de personas y un primer modulo fuerte de
          formacion.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy/5 text-navy">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-heading text-2xl text-navy">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                Abrir
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
