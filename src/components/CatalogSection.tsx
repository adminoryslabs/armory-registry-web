"use client";

import { useEffect, useRef, useState } from "react";
import type { ItemSummary, ItemType } from "@/types/item";
import { ApiError, fetchItems } from "@/lib/api";
import { ItemCard } from "./ItemCard";

interface CatalogSectionProps {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  query: string;
  /** Resultado ya cargado por el Server Component en el request inicial (sin búsqueda). */
  initialItems: ItemSummary[] | null;
  onItemOpen: (item: ItemSummary) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: ItemSummary[] };

export function CatalogSection({
  id,
  type,
  title,
  description,
  query,
  initialItems,
  onItemOpen,
}: CatalogSectionProps) {
  const [state, setState] = useState<LoadState>(
    initialItems ? { status: "ready", items: initialItems } : { status: "loading" },
  );
  const skipNextFetch = useRef(initialItems !== null);

  useEffect(() => {
    // Evita refetchear en el primer render cuando ya llegamos con datos
    // servidos por SSR y la búsqueda todavía está vacía.
    if (skipNextFetch.current && query === "") {
      skipNextFetch.current = false;
      return;
    }
    skipNextFetch.current = false;

    let cancelled = false;
    setState({ status: "loading" });

    fetchItems({ type, q: query || undefined })
      .then((response) => {
        if (cancelled) return;
        setState({ status: "ready", items: response.items });
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof ApiError
            ? error.message
            : "Ocurrió un error inesperado al cargar el catálogo.";
        setState({ status: "error", message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, query]);

  return (
    <section id={id} className="border-b border-outline-variant">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-xl text-sm text-on-surface-variant">{description}</p>

        <div className="mt-8">
          {state.status === "loading" && <LoadingGrid />}

          {state.status === "error" && (
            <div className="border border-error/50 bg-error/10 px-4 py-6 text-sm text-error">
              {state.message}
            </div>
          )}

          {state.status === "ready" && state.items.length === 0 && (
            <EmptyState type={type} hasQuery={query.trim().length > 0} />
          )}

          {state.status === "ready" && state.items.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.items.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={onItemOpen} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse border border-outline-variant bg-surface-container-low"
        />
      ))}
    </div>
  );
}

function EmptyState({ type, hasQuery }: { type: ItemType; hasQuery: boolean }) {
  if (type === "prompt" && !hasQuery) {
    return (
      <div className="border border-outline-variant bg-surface-container-low px-6 py-10 text-center">
        <p className="font-heading text-lg text-on-surface">
          Todavía no hay prompts publicados
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          La sección de Skills ya tiene contenido real para explorar mientras se suman los
          primeros prompts.
        </p>
      </div>
    );
  }

  if (type === "mcp" && !hasQuery) {
    return (
      <div className="border border-outline-variant bg-surface-container-low px-6 py-10 text-center">
        <p className="font-heading text-lg text-on-surface">
          Todavía no hay MCPs publicados
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          Las secciones de Skills y Prompts ya tienen contenido real para explorar mientras se
          suman los primeros MCPs.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-outline-variant bg-surface-container-low px-6 py-10 text-center text-sm text-on-surface-variant">
      Sin resultados para tu búsqueda.
    </div>
  );
}
