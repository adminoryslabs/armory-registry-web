"use client";

import { useState } from "react";

interface CopyButtonProps {
  /** Texto a copiar, o una función que lo resuelve (para pedir el detalle recién al hacer click). */
  getText: () => Promise<string> | string;
  label: string;
  className?: string;
}

type Status = "idle" | "copying" | "copied" | "error";

export function CopyButton({ getText, label, className = "" }: CopyButtonProps) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleClick() {
    if (status === "copying") return;
    setStatus("copying");
    try {
      const text = await getText();
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 1800);
    }
  }

  const label2 =
    status === "copied" ? "Copiado" : status === "error" ? "No se pudo copiar" : status === "copying" ? "Copiando..." : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "copying"}
      className={`font-mono text-xs px-3 py-2 border border-outline-variant bg-surface-container-low text-on-surface transition-colors hover:border-primary hover:text-primary disabled:opacity-60 ${
        status === "copied" ? "border-primary text-primary" : ""
      } ${status === "error" ? "border-error text-error" : ""} ${className}`}
    >
      {label2}
    </button>
  );
}
