import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookUser,
  ClipboardCheck,
  DoorOpen,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Shield,
  Users2
} from "lucide-react";

import { AccessPendingCard } from "@/components/access-pending-card";
import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentProfile } from "@/lib/auth";

type DashboardLayoutProps = {
  children: ReactNode;
};

function buildNavigation(profile: NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>["profile"]>) {
  const areaName = profile.area?.nombre?.toLowerCase() ?? "";
  const items = [
    {
      href: "/dashboard",
      label: "Resumen",
      icon: LayoutDashboard
    },
    {
      href: "/dashboard/personas",
      label: "Directorio JD-JP",
      icon: BookUser
    }
  ];

  if (profile.rol === "admin") {
    items.push(
      {
        href: "/dashboard/jd-jp",
        label: "Resolución JD-JP",
        icon: GitBranch
      },
      {
        href: "/dashboard/usuarios",
        label: "Usuarios",
        icon: Shield
      }
    );
  }

  if (profile.rol === "admin" || areaName.includes("form")) {
    items.push({
      href: "/dashboard/formacion",
      label: "Formación",
      icon: GraduationCap
    });
  }

  if (
    profile.rol === "admin" ||
    areaName.includes("desarrollo") ||
    areaName.includes("comunicaciones") ||
    areaName.includes("editorial")
  ) {
    items.push({
      href: "/dashboard/desarrollo",
      label: "Desarrollo y Comms",
      icon: Megaphone
    });
  }

  if (profile.rol === "admin" || areaName.includes("estudios") || areaName.includes("internacional")) {
    items.push({
      href: "/dashboard/estudios",
      label: "Estudios y Redes",
      icon: Users2
    });
  }

  return items;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile || !profile.activo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
        <AccessPendingCard email={user.email ?? ""} />
      </main>
    );
  }

  const navigation = buildNavigation(profile);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col bg-navy px-6 py-8 text-stone-100">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-2xl">IdeaPaís</p>
              <p className="text-sm text-stone-300">Sistema institucional</p>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Perfil activo</p>
            <p className="mt-2 text-base font-semibold text-white">{profile.nombre_completo}</p>
            <p className="text-sm text-stone-300">{profile.email}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-stone-100">{profile.rol}</span>
              {profile.area?.nombre ? (
                <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-stone-100">
                  {profile.area.nombre}
                </span>
              ) : null}
              {profile.sede?.nombre ? (
                <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-stone-100">
                  {profile.sede.nombre}
                </span>
              ) : null}
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
            <div className="mb-3 flex items-center gap-2 text-white">
              <ClipboardCheck className="h-4 w-4" />
              Operación segura
            </div>
            <p>
              El acceso efectivo depende del rol cargado en <code>perfiles_usuarios</code>. Los ingresos nuevos quedan
              contenidos sin romper la app.
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
            <div>
              <p className="text-sm text-stone-500">Backoffice analítico</p>
              <p className="font-semibold text-navy">
                {profile.area?.nombre ?? "Área no asignada"}
                {profile.sede?.nombre ? ` · ${profile.sede.nombre}` : ""}
              </p>
            </div>
            <SignOutButton />
          </header>

          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
