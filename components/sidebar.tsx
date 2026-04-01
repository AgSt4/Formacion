"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookUser, DoorOpen, GraduationCap, LayoutDashboard, ShieldCheck, UserCog } from "lucide-react";

import type { ProfileRecord } from "@/lib/types";

type SidebarProps = {
  profile: ProfileRecord;
};

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, visible: true },
    { href: "/dashboard/personas", label: "Personas", icon: BookUser, visible: true },
    {
      href: "/dashboard/formacion",
      label: "Formacion",
      icon: GraduationCap,
      visible: profile.rol !== "usuario" || profile.area?.nombre?.toLowerCase().includes("form")
    },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: UserCog, visible: profile.rol === "admin" }
  ].filter((item) => item.visible);

  return (
    <aside className="flex flex-col bg-navy px-6 py-8 text-stone-100 lg:min-h-screen">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <DoorOpen className="h-5 w-5" />
        </div>
        <div>
          <p className="font-heading text-2xl">IdeaPais</p>
          <p className="text-sm text-stone-300">Backoffice institucional</p>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
        <p className="font-semibold text-white">{profile.nombre_completo}</p>
        <p className="mt-1 break-all text-stone-300">{profile.email}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-semibold">
            {profile.rol}
          </span>
          {profile.area?.nombre ? (
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">{profile.area.nombre}</span>
          ) : null}
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-white/15 text-white" : "text-stone-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck className="h-4 w-4" />
          Acceso validado
        </div>
        <p className="mt-2">
          El ingreso depende de Google y del perfil activo en <code>perfiles_usuarios</code>.
        </p>
      </div>
    </aside>
  );
}
