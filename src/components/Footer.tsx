export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
        <p className="text-xs text-on-surface-variant">
          Armory indexa el contenido de{" "}
          <a
            href="https://github.com/adminoryslabs/Skills"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:text-primary-dim underline underline-offset-2"
          >
            adminoryslabs-skills
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
