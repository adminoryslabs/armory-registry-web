# Design: MCPs catalog section in registry-web

## Technical Approach

Extend the existing Skills/Prompts pattern (`CatalogSection` + `ItemCard` + `ItemModal` +
`CopyButton`) with a third `type: "mcp"`. No new components. Three axes of change: (1) widen
`ItemType` and add `repo_url`/`docs_url` to the shared item types, (2) thread a third SSR-loaded
list through `page.tsx` → `HomeClient` → `CatalogSection`, (3) turn the binary type-branch in
`ItemCard`/`ItemModal` into a 3-way branch, adding MCP-only repo/docs links.

## Architecture Decisions

### Decision: Section order — Skills, Prompts, MCPs (in that order), before Harnesses

**Choice**: `<CatalogSection id="mcps" type="mcp" .../>` is the third and last catalog section,
placed after Prompts and before the static `HarnessesSection`.
**Alternatives considered**: MCPs first (novelty-first); MCPs between Skills and Prompts.
**Rationale**: MCPs ships empty at launch (interim constraint — no backend data yet). A landing
page should lead with sections that have real, engaging content (Skills has the most content and
the strongest CTA — install command). Placing the empty section last means a first-time visitor
scrolls through two populated sections before hitting the "Todavía no hay MCPs publicados" state,
so the empty state reads as "the newest addition, more coming" rather than "the page is broken" —
same reasoning the proposal already validated for Prompts' own empty-state precedent. This also
matches maturity order in the current codebase (Skills was first, Prompts second, MCPs is the
newest content type per `registry-api`'s contract).

### Decision: Header.tsx copy fix — include in this PR

**Choice**: Update placeholder to `"Buscar skills, prompts, MCPs..."` and sr-only label to
`"Buscar skills, prompts y MCPs"`.
**Alternatives considered**: Defer to a follow-up PR.
**Rationale**: Two-line, zero-logic change directly caused by this feature; leaving it stale
creates an immediate, visible UX inconsistency (search bar undersells what it searches) the
moment MCPs ships. Deferring buys nothing — there is no scope, review, or risk reason to split it
out, and the proposal already recommended inclusion.

### Decision: ItemCard/ItemModal — in-place 3-way branching, with a tiny local label lookup (not a full TYPE_CONFIG object)

**Choice**: Keep JSX control flow as in-place conditionals (`item.type === "skill" ? A : B`,
extra `item.type === "mcp" && (...)` blocks for links). For the one part that scales linearly
with type count — label strings — use a local, unexported `Record<ItemType, string>` constant
per file, not a shared/exported module.
**Alternatives considered**: (a) pure 3-way `if/else if/else` duplicating the async
`getText`/label JSX per type; (b) a shared `TYPE_CONFIG` object bundling badge text, button
label, `getText`, and link rendering into one exported lookup consumed by both files.
**Rationale**: Read the actual code first — `getText` behavior is genuinely **binary** (skill:
sync install command; prompt/mcp: async `fetchItemDetail().body`), so a real 3-way `if/else if`
would force duplicating the async fetch branch for prompt and mcp identically, which is worse
than today's ternary, not better. Only the **label text** varies 3 ways. A small local
`Record<ItemType, string>` (not exported, no new file, no JSX inside it) solves exactly that
without introducing a new architectural pattern — the codebase has no config-object precedent
elsewhere, and a full `TYPE_CONFIG` bundling JSX/behavior would be the "heavier refactor" the
proposal flagged as a reason to revisit single-PR sizing. This keeps the diff minimal while
avoiding 3x string duplication across `ItemCard.tsx` and `ItemModal.tsx` (badge + button label).

### Decision: repo_url/docs_url link style — labeled text links, MCP-only, positioned after tags

**Choice**: Small row of labeled links (`"Repositorio →"`, `"Documentación →"`), rendered only
when `item.type === "mcp"` and the respective URL is present, styled `text-xs text-primary
hover:underline`, `target="_blank" rel="noreferrer"`. Positioned directly after the tags block,
before the CopyButton (`ItemCard`) / before the loading-detail block (`ItemModal`).
**Alternatives considered**: Icon-only links.
**Rationale**: No icon library exists anywhere in this codebase (`HarnessesSection`,
`LauncherCta` both use labeled text links with a trailing `→`, e.g. `"Ver repositorio →"`).
Icon-only would introduce a new dependency for one feature. Reusing the exact established
link idiom keeps zero new dependencies and visual consistency. Links render from `item`
(`ItemSummary`) directly — same source as `tags` — so they appear immediately in both the grid
card and the modal without waiting for the async detail fetch.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/item.ts` | Modify | `ItemType` → `"skill" \| "prompt" \| "mcp"`; add `repo_url?: string`, `docs_url?: string` to `ItemSummary` (inherited by `ItemDetail`) |
| `src/app/page.tsx` | Modify | `loadInitial(type: ItemType)`; add `initialMcps` via 3rd `Promise.all` call; pass to `HomeClient` |
| `src/components/HomeClient.tsx` | Modify | Accept `initialMcps: ItemSummary[] \| null`; render 3rd `<CatalogSection id="mcps" type="mcp" title="MCPs" description="Servidores MCP listos para conectar a tu agente. Copiá el prompt de instalación y sumalos en segundos." .../>` after Prompts, before `HarnessesSection` — copy follows the existing Skills/Prompts pattern (`title` = section name, `description` = one sentence on what the item does + the primary CTA) |
| `src/components/CatalogSection.tsx` | Modify | Add `type === "mcp" && !hasQuery` branch in `EmptyState`, message "Todavía no hay MCPs publicados" |
| `src/components/ItemCard.tsx` | Modify | Add local `COPY_LABELS: Record<ItemType, string>`; 3-way-aware CopyButton label; add MCP-only repo/docs links block after tags |
| `src/components/ItemModal.tsx` | Modify | Add local `TYPE_LABELS`/`COPY_LABELS`; badge uses `TYPE_LABELS[item.type]`; CopyButton label via lookup; add MCP-only repo/docs links block after tags |
| `src/components/Header.tsx` | Modify | Placeholder → `"Buscar skills, prompts, MCPs..."`; sr-only label → `"Buscar skills, prompts y MCPs"` |

No files created, no files deleted, no `McpCard.tsx`.

## Interfaces / Contracts

```ts
// src/types/item.ts
export type ItemType = "skill" | "prompt" | "mcp";

export interface ItemSummary {
  id: number;
  name: string;
  description: string;
  type: ItemType;
  tags: string[];
  path: string;
  updated_at: string;
  repo_url?: string;
  docs_url?: string;
}

export interface ItemDetail extends ItemSummary {
  body: string;
  install_command?: string;
}
```

```tsx
// ItemCard.tsx / ItemModal.tsx (local, unexported)
const COPY_LABELS: Record<ItemType, string> = {
  skill: "Copiar comando de instalación",
  prompt: "Copiar prompt",
  mcp: "Copiar prompt de instalación",
};
// ItemModal.tsx only
const TYPE_LABELS: Record<ItemType, string> = { skill: "Skill", prompt: "Prompt", mcp: "MCP" };
```

## Data Flow

    page.tsx (SSR)
      loadInitial("skill"|"prompt"|"mcp") ──→ Promise.all ──→ HomeClient(initialSkills/Prompts/Mcps)
                                                                    │
                                                     CatalogSection (id="mcps", type="mcp")
                                                                    │
                                                              GET /items?type=mcp (client-side refetch on query)
                                                                    │
                                              items=[] today → EmptyState(type="mcp")
                                              items=[...] post-backend → ItemCard[] (repo_url/docs_url rendered)
                                                                    │
                                                    onItemOpen → ItemModal (badge "MCP", links, CopyButton)

## Testing Strategy

No test runner in this repo (confirmed — not designing around TDD). Verification is manual/visual:

| Layer | What to Check | Approach |
|-------|---------------|----------|
| Types | `ItemType`/`ItemSummary` compile cleanly through all consumers | `tsc`/`next build` |
| Empty state | `GET /items?type=mcp` returns `{count:0, items:[]}` today | Load `/` locally, confirm "Todavía no hay MCPs publicados" renders, not error/broken grid |
| Regression | Skills/Prompts sections unchanged | Visual diff against current build, confirm ItemCard/ItemModal for `skill`/`prompt` render identically to before |
| Future-proofing | MCP card renders correctly once real data exists | Manually mock/patch `fetchItems` response with a `type: "mcp"` item incl. `repo_url`/`docs_url` in dev tools or a temp local mock, confirm badge "MCP", correct button label, both links render |

## Migration / Rollout

No migration required. Ships as a single PR; safe against `registry-api` not yet supporting
`type: mcp` (generic type filter already returns a well-formed empty response).

## Open Questions

None — all three questions from the proposal are resolved above.
