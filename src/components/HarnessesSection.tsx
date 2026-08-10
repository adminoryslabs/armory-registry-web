import { ComingSoonBadge } from "./ComingSoonBadge";

export function HarnessesSection() {
  return (
    <section id="harnesses" className="border-b border-outline-variant">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Harnesses</h2>
        <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
          Frameworks de orquestación para trabajar con agentes de forma estructurada.
        </p>

        <a
          href="https://github.com/Gentleman-Programming/gentle-ai"
          target="_blank"
          rel="noreferrer"
          className="mt-8 block max-w-xl border border-outline-variant bg-surface-container p-5 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-lg font-semibold text-on-surface">gentle-ai</h3>
            <span className="text-xs text-primary">Ver repositorio →</span>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            El harness de SDD que usamos y recomendamos en OrysLabs.
          </p>
          <p className="mt-3 text-xs text-on-surface-variant">
            Creado por{" "}
            <span className="text-primary underline underline-offset-2">
              Gentleman-Programming
            </span>
            . No es un desarrollo propio de OrysLabs.
          </p>
        </a>

        <p className="mt-4 flex max-w-xl items-center gap-2 text-xs text-on-surface-variant">
          Más harnesses propios de OrysLabs <ComingSoonBadge />
        </p>
      </div>
    </section>
  );
}
