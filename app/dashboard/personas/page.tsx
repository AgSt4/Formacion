import { SearchInput } from "@/components/search-input";
import { PersonasTable } from "@/components/personas-table";

type PersonasPageProps = {
  searchParams?: {
    q?: string | string[];
  };
};

export default function PersonasPage({ searchParams }: PersonasPageProps) {
  const rawQuery = searchParams?.q;
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Directorio de Identidades</h1>
        <p className="max-w-3xl text-base text-stone-600">
          Consulta personas consolidadas y detecta agrupaciones pendientes de revisi&oacute;n.
        </p>
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <SearchInput defaultValue={query} />
      </section>

      <PersonasTable query={query} />
    </div>
  );
}
