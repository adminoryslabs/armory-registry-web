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
    <div className="group flex h-full flex-col justify-between border border-outline-variant bg-surface-container p-4 transition-colors hover:bg-surface-container-high">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="text-left"
      >
        <h3 className="font-heading text-lg font-semibold text-on-surface group-hover:text-primary">
          {item.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-on-surface-variant">
          {item.description}
        </p>
      </button>

      {item.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="font-mono text-[11px] uppercase tracking-wide text-primary bg-primary-container px-1.5 py-0.5"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {item.type === "mcp" && (item.repo_url || item.docs_url) && (
        <div className="mt-3 flex flex-wrap gap-3">
          {item.repo_url && (
            <a
              href={item.repo_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Repositorio →
            </a>
          )}
          {item.docs_url && (
            <a
              href={item.docs_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Documentación →
            </a>
          )}
        </div>
      )}

      <div className="mt-4">
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
