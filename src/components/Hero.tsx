import { CopyButton } from "./CopyButton";

const GENERIC_INSTALL_COMMAND = "npx skills add adminoryslabs/Skills --skill <nombre>";

export function Hero() {
  return (
    <section id="top" className="border-b border-outline-variant">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          adminoryslabs-skills · catálogo público
        </p>
        <h1 className="mt-4 max-w-2xl font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          Skills y prompts listos para agentes de código
        </h1>
        <p className="mt-4 max-w-xl text-base text-on-surface-variant">
          Armory busca en vivo sobre el catálogo completo de{" "}
          <span className="text-on-surface">adminoryslabs-skills</span>: instalar un skill
          completo con un comando, o copiar un prompt para pegarlo donde se necesite.
        </p>

        <div className="mt-8 flex max-w-xl flex-col gap-3 border border-outline-variant bg-code-bg p-4 sm:flex-row sm:items-center sm:justify-between">
          <code className="font-mono text-sm text-primary">{GENERIC_INSTALL_COMMAND}</code>
          <CopyButton
            getText={() => GENERIC_INSTALL_COMMAND}
            label="Copiar comando"
            className="shrink-0"
          />
        </div>
      </div>
    </section>
  );
}
