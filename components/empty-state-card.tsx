import type { ReactNode } from "react";

type EmptyStateCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function EmptyStateCard({ title, description, icon }: EmptyStateCardProps) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
        {icon}
      </div>
      <p className="mt-5 font-heading text-2xl text-navy">{title}</p>
      <p className="mx-auto mt-2 max-w-2xl text-stone-500">{description}</p>
    </div>
  );
}
