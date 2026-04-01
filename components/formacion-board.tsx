"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type BoardCard = {
  id: string;
  rowId?: string;
  personId: string;
  nombre: string;
  sede: string;
  progreso: number;
};

type BoardColumn = {
  id: string;
  label: string;
};

const columns: BoardColumn[] = [
  { id: "difusion", label: "Difusion / Inscrito" },
  { id: "curso_basico", label: "Curso Basico" },
  { id: "seminario_avanzado", label: "Seminario Avanzado" },
  { id: "mentoria", label: "Mentoria" },
  { id: "graduado", label: "Graduado" }
];

const initialBoard = columns.reduce<Record<string, BoardCard[]>>((acc, column) => {
  acc[column.id] = [];
  return acc;
}, {});

type FormacionBoardProps = {
  routeId: string;
};

export function FormacionBoard({ routeId }: FormacionBoardProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [board, setBoard] = useState<Record<string, BoardCard[]>>(initialBoard);
  const [draggingCard, setDraggingCard] = useState<BoardCard | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoard() {
      const { data, error } = await supabase
        .from("dim_personas")
        .select("id, nombres, apellido_1, apellido_2, sede:sedes(nombre)")
        .order("apellido_1", { ascending: true })
        .limit(20);

      if (error) {
        setMessage(error.message);
        return;
      }

      const nextBoard = { ...initialBoard };
      (data ?? []).forEach((row, index) => {
        const column = columns[index % columns.length];
        nextBoard[column.id] = [
          ...nextBoard[column.id],
          {
            id: `${column.id}-${row.id}`,
            personId: row.id as string,
            nombre: [row.nombres, row.apellido_1, row.apellido_2].filter(Boolean).join(" "),
            sede: (row.sede as { nombre?: string } | null)?.nombre ?? "Sin sede",
            progreso: Math.min(100, 25 + index * 7)
          }
        ];
      });

      setBoard(nextBoard);
      setMessage(
        `Ruta ${routeId}: tablero inicial listo. En la siguiente fase podemos persistirlo con tablas propias de rutas.`
      );
    }

    loadBoard();
  }, [routeId, supabase]);

  function handleDrop(targetColumnId: string) {
    if (!draggingCard) {
      return;
    }

    setBoard((current) => {
      const cleaned = Object.fromEntries(
        Object.entries(current).map(([columnId, cards]) => [
          columnId,
          cards.filter((card) => card.id !== draggingCard.id)
        ])
      ) as Record<string, BoardCard[]>;

      cleaned[targetColumnId] = [...cleaned[targetColumnId], draggingCard];
      return cleaned;
    });

    setDraggingCard(null);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Ruta formativa</h1>
        <p className="max-w-3xl text-base text-stone-600">
          Tablero visual del funnel. El movimiento es manual por ahora para priorizar una base estable y util.
        </p>
      </div>

      {message ? (
        <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-600 shadow-card">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <section
            key={column.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(column.id)}
            className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-card"
          >
            <h2 className="font-heading text-xl text-navy">{column.label}</h2>
            <div className="mt-4 space-y-3">
              {board[column.id].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-200 p-4 text-sm text-stone-500">
                  Arrastra tarjetas aqui.
                </div>
              ) : (
                board[column.id].map((card) => (
                  <article
                    key={card.id}
                    draggable
                    onDragStart={() => setDraggingCard(card)}
                    className="cursor-grab rounded-2xl border border-stone-200 bg-cream p-4 active:cursor-grabbing"
                  >
                    <p className="font-semibold text-navy">{card.nombre}</p>
                    <p className="mt-1 text-sm text-stone-500">{card.sede}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                      <div className="h-full rounded-full bg-success" style={{ width: `${card.progreso}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                      <span>Progreso {card.progreso}%</span>
                      {card.progreso >= 75 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Listo para avanzar
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
