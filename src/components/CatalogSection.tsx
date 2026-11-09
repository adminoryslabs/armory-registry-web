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
  }, [type, query]);

  return (
    <section id={id} className="border-b border-orys-line">
      <div className="mx-auto max-w-6xl px-orys-4 py-orys-14 sm:px-orys-6">
        <h2 className="font-orys-sans text-orys-xl font-orys-semibold tracking-orys-head sm:text-orys-h3">
          {title}
        </h2>
        <p className="mt-orys-2 max-w-xl text-orys-sm text-orys-fg-dim">{description}</p>

        <div className="mt-orys-8">
          {state.status === "loading" && <LoadingGrid />}

          {state.status === "error" && (
            <div className="rounded-orys-md border border-orys-fail/50 bg-orys-fail-soft px-orys-4 py-orys-6 text-orys-sm text-orys-fail">
              {state.message}
            </div>
          )}

          {state.status === "ready" && state.items.length === 0 && (
            <EmptyState type={type} hasQuery={query.trim().length > 0} />
          )}

          {state.status === "ready" && state.items.length > 0 && (
            <div className="grid grid-cols-1 gap-orys-4 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="grid grid-cols-1 gap-orys-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-orys-lg border border-orys-line bg-orys-bg-raised"
        />
      ))}
    </div>
  );
}

function EmptyState({ type, hasQuery }: { type: ItemType; hasQuery: boolean }) {
  if (type === "prompt" && !hasQuery) {
    return (
      <div className="rounded-orys-lg border border-orys-line bg-orys-bg-raised px-orys-6 py-orys-10 text-center">
        <p className="font-orys-sans text-orys-lg text-orys-fg">
          Todavía no hay prompts publicados
        </p>
        <p className="mt-orys-2 text-orys-sm text-orys-fg-dim">
          La sección de Skills ya tiene contenido real para explorar mientras se suman los
          primeros prompts.
        </p>
      </div>
    );
  }

  if (type === "mcp" && !hasQuery) {
    return (
      <div className="rounded-orys-lg border border-orys-line bg-orys-bg-raised px-orys-6 py-orys-10 text-center">
        <p className="font-orys-sans text-orys-lg text-orys-fg">
          Todavía no hay MCPs publicados
        </p>
        <p className="mt-orys-2 text-orys-sm text-orys-fg-dim">
          Las secciones de Skills y Prompts ya tienen contenido real para explorar mientras se
          suman los primeros MCPs.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-orys-lg border border-orys-line bg-orys-bg-raised px-orys-6 py-orys-10 text-center text-orys-sm text-orys-fg-dim">
      Sin resultados para tu búsqueda.
    </div>
  );
}
