export function LauncherCta() {
  return (
    <section id="launcher" className="border-b border-orys-line">
      <div className="mx-auto max-w-6xl px-orys-4 py-orys-14 sm:px-orys-6">
        <div className="rounded-orys-xl border border-orys-line bg-orys-bg-raised p-orys-6 shadow-orys-panel sm:p-orys-8">
          <div className="flex flex-wrap items-center justify-between gap-orys-3">
            <h2 className="font-orys-sans text-orys-xl font-orys-semibold tracking-orys-head sm:text-orys-h3">
              Prompts sin salir del editor
            </h2>
            <a
              href="https://github.com/adminoryslabs/armory-launcher-desktop/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="rounded-orys-md border border-orys-line-brand bg-orys-accent/10 px-orys-4 py-orys-2 text-orys-sm font-orys-semibold text-orys-accent transition-colors hover:bg-orys-accent hover:text-orys-fg-on-accent"
            >
              Descargar para Windows
            </a>
          </div>
          <p className="mt-orys-3 max-w-xl text-orys-sm text-orys-fg-dim">
            <span className="text-orys-fg">Armory Launcher</span> es una app nativa con hotkey
            global (<code className="font-orys-mono text-orys-xs">Ctrl+Shift+Space</code>): busca
            un skill o un prompt y lo copia donde se esté escribiendo, sin cambiar de ventana ni
            volver al navegador.
          </p>
        </div>
      </div>
    </section>
  );
}
