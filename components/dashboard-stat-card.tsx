import type { ReactNode } from "react";

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  accent?: "navy" | "amber" | "forest";
};

const accentStyles = {
  navy: "bg-navy/5 text-navy",
  amber: "bg-amber/10 text-amber",
  forest: "bg-forest/10 text-forest"
};

export function DashboardStatCard({
  label,
  value,
  description,
  icon,
  accent = "navy"
}: DashboardStatCardProps) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
          <p className="mt-3 font-heading text-4xl text-navy">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentStyles[accent]}`}>{icon}</div>
      </div>
      <p className="mt-4 text-sm text-stone-600">{description}</p>
    </article>
  );
}
