export function LauncherCta() {
  return (
    <section id="launcher" className="border-b border-outline-variant">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="border border-outline-variant bg-surface-container p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              Prompts sin salir del editor
            </h2>
            <a
              href="https://github.com/adminoryslabs/armory-launcher-desktop/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="border border-primary bg-primary-container px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-on-primary"
            >
              Descargar para Windows
            </a>
          </div>
          <p className="mt-3 max-w-xl text-sm text-on-surface-variant">
            <span className="text-on-surface">Armory Launcher</span> es una app nativa con hotkey
            global (<code className="font-mono text-xs">Ctrl+Shift+Space</code>): busca un skill o
            un prompt y lo copia donde se esté escribiendo, sin cambiar de ventana ni volver al
            navegador.
          </p>
        </div>
      </div>
    </section>
  );
}
