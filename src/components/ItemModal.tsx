"use client";

import { useEffect, useState } from "react";
import type { ItemDetail, ItemSummary } from "@/types/item";
import { ApiError, buildInstallCommand, fetchItemDetail } from "@/lib/api";
import { CopyButton } from "./CopyButton";

interface ItemModalProps {
  item: ItemSummary;
  onClose: () => void;
}

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; detail: ItemDetail };

export function ItemModal({ item, onClose }: ItemModalProps) {
  const [state, setState] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchItemDetail(item.name)
      .then((detail) => {
        if (!cancelled) setState({ status: "ready", detail });
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof ApiError
            ? error.message
            : "Ocurrió un error inesperado al cargar el detalle.";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, [item.name]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-surface/80 px-4 py-10 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl border border-outline-variant bg-surface-container p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wide text-primary">
              {item.type === "skill" ? "Skill" : "Prompt"}
            </span>
            <h3 className="mt-1 font-heading text-2xl font-semibold text-on-surface">
              {item.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="border border-outline-variant px-2 py-1 text-on-surface-variant hover:border-primary hover:text-primary"
          >
            ×
          </button>
        </div>

        <p className="mt-3 text-sm text-on-surface-variant">{item.description}</p>

        {item.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="font-mono text-[11px] uppercase tracking-wide text-primary bg-primary-container px-1.5 py-0.5"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5">
          {state.status === "loading" && (
            <div className="h-32 animate-pulse border border-outline-variant bg-surface-container-low" />
          )}

          {state.status === "error" && (
            <div className="border border-error/50 bg-error/10 px-4 py-4 text-sm text-error">
              {state.message}
            </div>
          )}

          {state.status === "ready" && (
            <>
              <div className="mb-4">
                {item.type === "skill" ? (
                  <CopyButton
                    getText={() =>
                      state.detail.install_command ?? buildInstallCommand(item.name)
                    }
                    label="Copiar comando de instalación"
                  />
                ) : (
                  <CopyButton
                    getText={() => state.detail.body}
                    label="Copiar prompt"
                  />
                )}
              </div>
              <div className="max-h-80 overflow-y-auto border border-outline-variant bg-surface-container-low p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-on-surface-variant">
                  {state.detail.body}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
