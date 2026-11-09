export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-orys-2 px-orys-4 py-orys-8 text-center sm:px-orys-6">
        <p className="text-orys-xs text-orys-fg-dim">
          Armory indexa el contenido de{" "}
          <a
            href="https://github.com/adminoryslabs/Armory"
            target="_blank"
            rel="noreferrer"
            className="text-orys-accent underline underline-offset-2 hover:text-orys-accent-deep"
          >
            adminoryslabs-skills
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
