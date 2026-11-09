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

  const tone =
    status === "copied"
      ? "border-orys-accent bg-orys-accent/10 text-orys-accent"
      : status === "error"
        ? "border-orys-fail bg-orys-fail-soft text-orys-fail"
        : "border-orys-line bg-orys-bg-input text-orys-fg hover:border-orys-line-brand hover:text-orys-accent";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "copying"}
      className={`rounded-orys-md border px-orys-3 py-orys-2 font-orys-mono text-orys-xs transition-colors disabled:opacity-60 ${tone} ${className}`}
    >
      {label2}
    </button>
  );
}
