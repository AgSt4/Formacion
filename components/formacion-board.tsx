"use client";

import { useState } from "react";

type Card = {
  id: string;
  nombre: string;
  sede: string;
  progreso: number;
};

const initialBoard: Record<string, Card[]> = {
  difusion: [
    { id: "1", nombre: "María Valdés", sede: "Santiago", progreso: 20 },
    { id: "2", nombre: "Tomás Ruiz", sede: "Los Lagos", progreso: 35 }
  ],
  basico: [{ id: "3", nombre: "Josefa Reyes", sede: "Valparaíso", progreso: 76 }],
  avanzado: [{ id: "4", nombre: "Benjamín Soto", sede: "Santiago", progreso: 84 }],
  mentoria: [],
  graduado: [{ id: "5", nombre: "Catalina Pérez", sede: "Concepción", progreso: 100 }]
};

const columns = [
  { id: "difusion", label: "Difusión / Inscrito" },
  { id: "basico", label: "Curso Básico" },
  { id: "avanzado", label: "Seminario Avanzado" },
  { id: "mentoria", label: "Mentoría" },
  { id: "graduado", label: "Graduado" }
];

export function FormacionBoard() {
  const [board, setBoard] = useState(initialBoard);

  function moveCard(columnId: string, cardId: string) {
    const currentIndex = columns.findIndex((column) => column.id === columnId);
    const nextColumn = columns[currentIndex + 1];

    if (!nextColumn) {
      return;
    }

    const card = board[columnId].find((item) => item.id === cardId);

    if (!card) {
      return;
    }

    setBoard((current) => ({
      ...current,
      [columnId]: current[columnId].filter((item) => item.id !== cardId),
      [nextColumn.id]: [...current[nextColumn.id], card]
    }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-navy">Ruta Formativa</h1>
        <p className="text-stone-600">Tablero simple del funnel para visualizar avance y promover personas por etapa.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <section key={column.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="font-heading text-xl text-navy">{column.label}</h2>
            <div className="mt-4 space-y-3">
              {board[column.id].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-200 p-4 text-sm text-stone-500">
                  Sin personas en esta etapa.
                </div>
              ) : (
                board[column.id].map((card) => (
                  <article key={card.id} className="rounded-2xl border border-stone-200 bg-cream p-4">
                    <p className="font-semibold text-navy">{card.nombre}</p>
                    <p className="text-sm text-stone-500">{card.sede}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                      <div className="h-full rounded-full bg-forest" style={{ width: `${card.progreso}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                      <span>Asistencia {card.progreso}%</span>
                      {card.progreso >= 75 ? <span className="font-semibold text-forest">Listo para avanzar</span> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => moveCard(column.id, card.id)}
                      className="mt-3 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white"
                    >
                      Mover a siguiente etapa
                    </button>
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
