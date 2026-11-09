import type { ItemSummary, ItemType } from "@/types/item";
import { buildInstallCommand, fetchItemDetail } from "@/lib/api";
import { CopyButton } from "./CopyButton";

const COPY_LABELS: Record<ItemType, string> = {
  skill: "Copiar comando de instalación",
  prompt: "Copiar prompt",
  mcp: "Copiar prompt de instalación",
};

interface ItemCardProps {
  item: ItemSummary;
  onOpen: (item: ItemSummary) => void;
}

export function ItemCard({ item, onOpen }: ItemCardProps) {
  return (
    <div className="group flex h-full flex-col justify-between rounded-orys-lg border border-orys-line bg-orys-bg-raised p-orys-4 shadow-orys-panel transition-colors hover:border-orys-line-brand hover:bg-orys-bg-higher">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="text-left"
      >
        <h3 className="font-orys-sans text-orys-lg font-orys-semibold text-orys-fg group-hover:text-orys-accent">
          {item.name}
        </h3>
        <p className="mt-orys-2 line-clamp-3 text-orys-sm text-orys-fg-dim">
          {item.description}
        </p>
      </button>

      {item.tags.length > 0 && (
        <ul className="mt-orys-3 flex flex-wrap gap-orys-1">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-orys-sm bg-orys-accent/10 px-orys-2 py-orys-1 font-orys-mono text-orys-xs uppercase tracking-orys-mono-tight text-orys-accent"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {item.type === "mcp" && (item.repo_url || item.docs_url) && (
        <div className="mt-orys-3 flex flex-wrap gap-orys-3">
          {item.repo_url && (
            <a
              href={item.repo_url}
              target="_blank"
              rel="noreferrer"
              className="text-orys-xs text-orys-accent hover:underline"
            >
              Repositorio →
            </a>
          )}
          {item.docs_url && (
            <a
              href={item.docs_url}
              target="_blank"
              rel="noreferrer"
              className="text-orys-xs text-orys-accent hover:underline"
            >
              Documentación →
            </a>
          )}
        </div>
      )}

      <div className="mt-orys-4">
        {item.type === "skill" ? (
          <CopyButton
            getText={() => buildInstallCommand(item.name)}
            label={COPY_LABELS[item.type]}
            className="w-full"
          />
        ) : (
          <CopyButton
            getText={async () => {
              const detail = await fetchItemDetail(item.name);
              return detail.body;
            }}
            label={COPY_LABELS[item.type]}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
