import { ComingSoonBadge } from "./ComingSoonBadge";

export function HarnessesSection() {
  return (
    <section id="harnesses" className="border-b border-orys-line">
      <div className="mx-auto max-w-6xl px-orys-4 py-orys-14 sm:px-orys-6">
        <h2 className="font-orys-sans text-orys-xl font-orys-semibold tracking-orys-head sm:text-orys-h3">
          Harnesses
        </h2>
        <p className="mt-orys-2 max-w-xl text-orys-sm text-orys-fg-dim">
          Frameworks de orquestación para trabajar con agentes de forma estructurada.
        </p>

        <a
          href="https://github.com/Gentleman-Programming/gentle-ai"
          target="_blank"
          rel="noreferrer"
          className="mt-orys-8 block max-w-xl rounded-orys-lg border border-orys-line bg-orys-bg-raised p-orys-5 shadow-orys-panel transition-colors hover:border-orys-line-brand"
        >
          <div className="flex items-center justify-between gap-orys-3">
            <h3 className="font-orys-sans text-orys-lg font-orys-semibold text-orys-fg">
              gentle-ai
            </h3>
            <span className="text-orys-xs text-orys-accent">Ver repositorio →</span>
          </div>
          <p className="mt-orys-2 text-orys-sm text-orys-fg-dim">
            El harness de SDD que usamos y recomendamos en OrysLabs.
          </p>
          <p className="mt-orys-3 text-orys-xs text-orys-fg-dim">
            Creado por{" "}
            <span className="text-orys-accent underline underline-offset-2">
              Gentleman-Programming
            </span>
            . No es un desarrollo propio de OrysLabs.
          </p>
        </a>

        <p className="mt-orys-4 flex max-w-xl items-center gap-orys-2 text-orys-xs text-orys-fg-dim">
          Más harnesses propios de OrysLabs <ComingSoonBadge />
        </p>
      </div>
    </section>
  );
}
