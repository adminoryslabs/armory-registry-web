"use client";

interface HeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export function Header({ query, onQueryChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <a href="#top" className="font-heading text-xl font-semibold tracking-tight text-on-surface">
          Armory
        </a>
        <div className="w-full sm:max-w-md">
          <label className="sr-only" htmlFor="global-search">
            Buscar skills y prompts
          </label>
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar skills, prompts..."
            className="w-full border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
}
