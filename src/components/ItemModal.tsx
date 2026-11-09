"use client";

import { useEffect, useState } from "react";
import type { ItemDetail, ItemSummary, ItemType } from "@/types/item";
import { ApiError, buildInstallCommand, fetchItemDetail } from "@/lib/api";
import { CopyButton } from "./CopyButton";

const TYPE_LABELS: Record<ItemType, string> = {
  skill: "Skill",
  prompt: "Prompt",
  mcp: "MCP",
};

const COPY_LABELS: Record<ItemType, string> = {
  skill: "Copiar comando de instalación",
  prompt: "Copiar prompt",
  mcp: "Copiar prompt de instalación",
};

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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-orys-bg/80 px-orys-4 py-orys-10 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl rounded-orys-2xl border border-orys-line bg-orys-bg-raised p-orys-6 shadow-orys-panel"
      >
        <div className="flex items-start justify-between gap-orys-4">
          <div>
            <span className="font-orys-mono text-orys-xs uppercase tracking-orys-mono-tight text-orys-accent">
              {TYPE_LABELS[item.type]}
            </span>
            <h3 className="mt-orys-1 font-orys-sans text-orys-xl font-orys-semibold tracking-orys-head text-orys-fg">
              {item.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-orys-md border border-orys-line px-orys-2 py-orys-1 text-orys-fg-dim hover:border-orys-line-brand hover:text-orys-accent"
          >
            ×
          </button>
        </div>

        <p className="mt-orys-3 text-orys-sm text-orys-fg-dim">{item.description}</p>

        {item.tags.length > 0 && (
          <ul className="mt-orys-3 flex flex-wrap gap-orys-1">
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-orys-sm bg-orys-accent/10 px-orys-2 py-orys-1 font-orys-mono text-orys-xs uppercase tracking-orys-mono-tight text-orys-accent"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {item.type === "mcp" && (item.repo_url || item.docs_url) && (
          <div className="mt-orys-3 flex flex-wrap gap-orys-3">
            {item.repo_url && (
              <a
                href={item.repo_url}
                target="_blank"
                rel="noreferrer"
                className="text-orys-xs text-orys-accent hover:underline"
              >
                Repositorio →
              </a>
            )}
            {item.docs_url && (
              <a
                href={item.docs_url}
                target="_blank"
                rel="noreferrer"
                className="text-orys-xs text-orys-accent hover:underline"
              >
                Documentación →
              </a>
            )}
          </div>
        )}

        <div className="mt-orys-5">
          {state.status === "loading" && (
            <div className="h-32 animate-pulse rounded-orys-md border border-orys-line bg-orys-bg-input" />
          )}

          {state.status === "error" && (
            <div className="rounded-orys-md border border-orys-fail/50 bg-orys-fail-soft px-orys-4 py-orys-4 text-orys-sm text-orys-fail">
              {state.message}
            </div>
          )}

          {state.status === "ready" && (
            <>
              <div className="mb-orys-4">
                {item.type === "skill" ? (
                  <CopyButton
                    getText={() =>
                      state.detail.install_command ?? buildInstallCommand(item.name)
                    }
                    label={COPY_LABELS[item.type]}
                  />
                ) : (
                  <CopyButton
                    getText={() => state.detail.body}
                    label={COPY_LABELS[item.type]}
                  />
                )}
              </div>
              <div className="max-h-80 overflow-y-auto rounded-orys-md border border-orys-line bg-orys-bg-input p-orys-4">
                <pre className="whitespace-pre-wrap font-orys-mono text-orys-xs leading-orys-body text-orys-fg-dim">
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
