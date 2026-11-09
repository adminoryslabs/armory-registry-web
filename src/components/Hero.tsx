import { CopyButton } from "./CopyButton";

const GENERIC_INSTALL_COMMAND = "npx skills add adminoryslabs/Armory --skill <nombre>";

export function Hero() {
  return (
    <section id="top" className="border-b border-orys-line">
      <div className="mx-auto max-w-6xl px-orys-4 py-orys-16 sm:px-orys-6 sm:py-orys-20">
        <p className="font-orys-mono text-orys-xs uppercase tracking-orys-mono-wide text-orys-accent">
          adminoryslabs-skills · catálogo público
        </p>
        <h1 className="mt-orys-4 max-w-2xl font-orys-sans text-orys-h3 font-orys-semibold leading-orys-head tracking-orys-head sm:text-orys-h2">
          Skills y prompts listos para agentes de código
        </h1>
        <p className="mt-orys-4 max-w-xl text-orys-base text-orys-fg-dim">
          Armory busca en vivo sobre el catálogo completo de{" "}
          <span className="text-orys-fg">adminoryslabs-skills</span>: instalar un skill
          completo con un comando, o copiar un prompt para pegarlo donde se necesite.
        </p>

        <div className="mt-orys-8 flex max-w-xl flex-col gap-orys-3 rounded-orys-lg border border-orys-line bg-orys-bg-input p-orys-4 shadow-orys-panel sm:flex-row sm:items-center sm:justify-between">
          <code className="font-orys-mono text-orys-sm text-orys-accent">
            {GENERIC_INSTALL_COMMAND}
          </code>
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
