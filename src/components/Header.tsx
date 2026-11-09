"use client";

interface HeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export function Header({ query, onQueryChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-orys-line bg-orys-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-orys-3 px-orys-4 py-orys-4 sm:flex-row sm:items-center sm:justify-between sm:px-orys-6">
        <a
          href="#top"
          className="font-orys-sans text-orys-xl font-orys-semibold tracking-orys-head text-orys-fg"
        >
          Armory
        </a>
        <div className="w-full sm:max-w-md">
          <label className="sr-only" htmlFor="global-search">
            Buscar skills, prompts y MCPs
          </label>
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar skills, prompts, MCPs..."
            className="w-full rounded-orys-md border border-orys-line bg-orys-bg-input px-orys-3 py-orys-2 text-orys-sm text-orys-fg placeholder:text-orys-fg-mute focus:border-orys-accent focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
}
