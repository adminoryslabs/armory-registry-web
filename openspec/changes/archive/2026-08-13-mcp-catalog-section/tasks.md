# Tasks: MCPs catalog section in registry-web

Delivery: single PR (confirmed). No test runner — verification is manual/visual (`npm run build`
+ visual walkthrough) per design's Testing Strategy table. Follow task order; tasks in the same
numbered group with "(parallel)" have no dependency on each other and may be done in any order,
but all of group N must be done before group N+1 starts unless noted otherwise.

## 1. Foundation — shared item types

### 1.1 Widen `ItemType` and add MCP link fields
**File**: `src/types/item.ts`
**Change**:
- `ItemType` → `"skill" | "prompt" | "mcp"`
- Add `repo_url?: string` and `docs_url?: string` to `ItemSummary` (inherited by `ItemDetail`
  via `extends`)
**Satisfies**: `item-types` spec — "`ItemType` MUST include `\"mcp\"`" (scenario: type-checking a
component with `type="mcp"`); "`ItemSummary` and `ItemDetail` MUST carry optional MCP link
fields" (both scenarios: skill/prompt item without link fields still type-checks, MCP item with
both link fields type-checks).
**Verify**: Open the file, confirm both fields are present and optional (`?`). This is the only
task with no visual output — verified by the group-4 `tsc`/build task and by every downstream
consumer compiling.
**Blocks**: everything else in this checklist (every other file imports `ItemType`/`ItemSummary`
from this module).
**Status**: [x] Done.

## 2. Correctness fix — ItemCard and ItemModal 3-way branch (parallel with group 3)

### 2.1 `ItemCard.tsx` — 3-way branch, MCP links, MCP copy label
**File**: `src/components/ItemCard.tsx`
**Change**:
- Add a local, unexported `COPY_LABELS: Record<ItemType, string>` constant:
  `{ skill: "Copiar comando de instalación", prompt: "Copiar prompt", mcp: "Copiar prompt de
  instalación" }`
- Replace the binary `item.type === "skill" ? <CopyButton getText={sync install command}/> :
  <CopyButton getText={async fetchItemDetail}/>` with a 3-way-aware version: keep the `skill`
  branch's `getText={() => buildInstallCommand(item.name)}` sync path; for BOTH `prompt` and
  `mcp` use the existing async `getText={async () => (await fetchItemDetail(item.name)).body}`
  path (do not duplicate the async block per design's rationale — this is still effectively a
  binary `getText` choice, only the label lookup is 3-way). Use `COPY_LABELS[item.type]` as the
  `label` prop in both branches.
- Add an MCP-only repo/docs links block: `item.type === "mcp" && (item.repo_url ||
  item.docs_url) && (...)`, rendering a link to `item.repo_url` labeled `"Repositorio →"` and a
  link to `item.docs_url` labeled `"Documentación →"` (each conditionally rendered only if its
  own URL is present), styled `text-xs text-primary hover:underline`, with `target="_blank"
  rel="noreferrer"`. Position: directly after the tags `<ul>` block, before the `<div
  className="mt-4">` CopyButton wrapper.
**Satisfies**: `item-card-and-modal` spec — "MCP item in `ItemCard` does not fall through to the
Prompt branch"; "Skill and Prompt rendering is unchanged after introducing the 3-way branch";
"`ItemCard` MUST render `repo_url` and `docs_url` links for MCP items" (both scenarios: MCP card
with both links present, MCP card renders the install-prompt copy button).
**Verify**: Visually confirm Skill cards still show "Copiar comando de instalación" and Prompt
cards still show "Copiar prompt" (byte-for-byte unchanged labels/behavior). Cannot visually
confirm MCP rendering yet (no backend `type: mcp` data) — defer to group 5's mock-data check.
**Depends on**: 1.1.
**Status**: [x] Done (code implemented + build-verified; live-browser mock-data check deferred to
user per task 6.2 note).

### 2.2 `ItemModal.tsx` — 3-way branch, badge, MCP links, MCP copy label
**File**: `src/components/ItemModal.tsx`
**Change**:
- Add local, unexported `TYPE_LABELS: Record<ItemType, string>` = `{ skill: "Skill", prompt:
  "Prompt", mcp: "MCP" }` and reuse the same `COPY_LABELS` shape as `ItemCard.tsx` (defined
  locally in this file too, per design — not shared/exported).
- Replace the header badge `{item.type === "skill" ? "Skill" : "Prompt"}` with
  `{TYPE_LABELS[item.type]}`.
- Replace the binary CopyButton block (`item.type === "skill" ? <installCommand> :
  <state.detail.body>`) with a 3-way-aware version: keep `skill`'s
  `getText={() => state.detail.install_command ?? buildInstallCommand(item.name)}`; for both
  `prompt` and `mcp` use `getText={() => state.detail.body}`. Use `COPY_LABELS[item.type]` as the
  `label` prop.
- Add the same MCP-only repo/docs links block as `ItemCard.tsx` (`"Repositorio →"` /
  `"Documentación →"`, same styling, `target="_blank" rel="noreferrer"`), sourced from `item`
  (the `ItemSummary` prop, available immediately — not from `state.detail`, so links render
  before the async detail fetch resolves). Position: directly after the tags `<ul>` block, before
  the `<div className="mt-5">` detail-state block (loading/error/ready).
**Satisfies**: `item-card-and-modal` spec — "MCP item in `ItemModal` shows an \"MCP\" badge, not
\"Prompt\""; "Skill and Prompt rendering is unchanged after introducing the 3-way branch";
"`ItemModal` MUST render `repo_url` and `docs_url` links for MCP items" (scenario: MCP modal
shows links once detail data has loaded).
**Verify**: Open a Skill and a Prompt item in the modal, confirm badge text and copy-button label
are unchanged from before this task. Defer MCP-specific visual check to group 5.
**Depends on**: 1.1.
**Status**: [x] Done (code implemented + build-verified; live-browser mock-data check deferred to
user per task 6.2 note).

## 3. Independent — CatalogSection empty state (parallel with group 2)

### 3.1 Add MCP empty-state branch to `CatalogSection.tsx`
**File**: `src/components/CatalogSection.tsx`
**Change**: In the `EmptyState` function, extend the `type === "prompt" && !hasQuery` special
case to also cover `type === "mcp" && !hasQuery`, rendering "Todavía no hay MCPs publicados" as
the heading (mirror the existing Prompts empty-state JSX structure/classes; the exact
supplementary sentence under the heading is free to write in the same tone as the Prompts one,
e.g. referencing that Skills/Prompts already have content). Do not touch the generic "Sin
resultados para tu búsqueda." fallback — it must keep applying when `hasQuery` is true for `mcp`
same as it does for `prompt`.
**Satisfies**: `mcp-catalog-section` spec — "The empty MCPs section MUST render an intentional,
non-error empty state" (scenario: empty MCPs section without an active search query); "No
results for an active search query" scenario (falls through to the existing generic branch
unchanged — verify it still does after your edit).
**Verify**: Cannot visually verify without the section mounted yet — defer render check to group
5. Code review check: confirm the `type === "prompt"` condition was extended/duplicated for
`"mcp"`, not replaced (Prompts empty state must remain intact — "Prompts section behavior is
unaffected" per `mcp-catalog-section` spec's MODIFIED requirement).
**Depends on**: 1.1 (uses `ItemType` in its prop signature, though the type itself doesn't need
edits — depends on the module compiling with `"mcp"` as a valid `ItemType` value).
**Status**: [x] Done. Confirmed the `type === "prompt"` branch was preserved untouched and the
`"mcp"` branch was added alongside it, not as a replacement.

## 4. Wiring — mount the MCPs section end-to-end

### 4.1 `page.tsx` — SSR-fetch initial MCPs data
**File**: `src/app/page.tsx`
**Change**:
- Widen `loadInitial`'s parameter type from `type: "skill" | "prompt"` to `type: ItemType`
  (import `ItemType` from `@/types/item`).
- Add a third parallel call inside the existing `Promise.all([...])`: `loadInitial("mcp")`,
  destructured as `initialMcps`.
- Pass `initialMcps` as a new prop to `<HomeClient initialSkills={...} initialPrompts={...}
  initialMcps={initialMcps} />`.
**Satisfies**: `mcp-catalog-section` spec — "`page.tsx` MUST server-render initial MCPs data
alongside Skills and Prompts" (both scenarios: initial page load includes server-rendered MCPs
data, `registry-api` unreachable at request time — the existing `try/catch → null` fallback in
`loadInitial` already covers the unreachable case once the type param is widened, no new
error-handling logic needed).
**Verify**: Cannot fully verify until 4.2 wires `HomeClient` to accept/use the prop — this task
alone will not compile cleanly on its own (`HomeClient` doesn't accept `initialMcps` yet). Treat
4.1 and 4.2 as effectively one atomic change if easier to implement together; verify both via the
group 4 build task.
**Depends on**: 1.1.
**Status**: [x] Done, implemented together with 4.2.

### 4.2 `HomeClient.tsx` — accept `initialMcps`, render the MCPs section
**File**: `src/components/HomeClient.tsx`
**Change**:
- Add `initialMcps: ItemSummary[] | null` to `HomeClientProps` and to the destructured function
  params.
- Add a third `<CatalogSection>` between the existing Prompts section and `<HarnessesSection
  />`:
  ```tsx
  <CatalogSection
    id="mcps"
    type="mcp"
    title="MCPs"
    description="Servidores MCP listos para conectar a tu agente. Copiá el prompt de instalación y sumalos en segundos."
    query={debouncedQuery}
    initialItems={initialMcps}
    onItemOpen={setSelectedItem}
  />
  ```
  (title/description text is exact per design — do not alter wording.)
**Satisfies**: `mcp-catalog-section` spec — "The page MUST render an MCPs catalog section" (all
four scenarios: loading state, error state, populated cards, reacts to shared global search —
all inherited for free from `CatalogSection`'s existing state machine, no new logic in this
file); design's "Decision: Section order — Skills, Prompts, MCPs..., before Harnesses" (exact
placement: after Prompts, before `HarnessesSection`).
**Verify**: `npm run dev`, load `/`, confirm:
  - MCPs section renders after Prompts, before Harnesses, with heading "MCPs" and the exact
    description text above.
  - Since `registry-api` has no `type: mcp` data yet, it should show group 3.1's empty state
    ("Todavía no hay MCPs publicados"), not an error banner or a blank gap.
  - Skills and Prompts sections render exactly as before (no visual regression).
**Depends on**: 1.1, 3.1 (empty-state branch must exist for the mounted section to render
correctly instead of falling through to the generic "Sin resultados" message), 4.1 (needs
`initialMcps` from `page.tsx`).
**Status**: [x] Done, implemented together with 4.1. Section placement and exact copy text
verified by code review against design.

## 5. Trivial, no dependencies (can be done anytime, listed last for convenience)

### 5.1 `Header.tsx` — update search copy
**File**: `src/components/Header.tsx`
**Change**:
- `placeholder="Buscar skills, prompts..."` → `placeholder="Buscar skills, prompts, MCPs..."`
- `sr-only` label text `Buscar skills y prompts` → `Buscar skills, prompts y MCPs`
**Satisfies**: Design's "Decision: Header.tsx copy fix — include in this PR." Not directly tied
to a numbered spec requirement/scenario (proposal item 7, resolved as in-scope by design) — this
is copy-only, zero logic impact.
**Verify**: Visually confirm the search input placeholder and inspect the `sr-only` label (e.g.
via browser dev tools accessibility tree or view-source) show the updated text.
**Depends on**: nothing — fully independent, safe to do at any point in the sequence.
**Status**: [x] Done, confirmed via code review.

## 6. Final verification pass

### 6.1 Type-check / build
**Command**: `npm run build` (or `npx tsc --noEmit` if a faster standalone type-check is
preferred first)
**Checks**: Confirms `ItemType`/`ItemSummary` changes from 1.1 compile cleanly across every
consumer touched in groups 2-5 (`ItemCard.tsx`, `ItemModal.tsx`, `CatalogSection.tsx`,
`page.tsx`, `HomeClient.tsx`) — no `any`, no type errors, no leftover binary-branch code that no
longer matches the 3-value `ItemType` union.
**Satisfies**: Design's Testing Strategy table, "Types" row.
**Depends on**: all of groups 1-5.
**Status**: [x] Done. `npx tsc --noEmit` and `npm run build` both pass cleanly (zero type errors,
zero warnings introduced). `git diff --stat` confirms exactly the 7 files from the File Changes
table were touched, no 8th file, no `McpCard.tsx` created.

### 6.2 Manual walkthrough
**Steps** (`npm run dev`, browse `http://localhost:3001` or whichever port Next.js picks):
1. **Empty MCPs state**: confirm the MCPs section (after Prompts, before Harnesses) shows
   "Todavía no hay MCPs publicados" — not an error banner, not a blank gap, not the generic "Sin
   resultados" message (that only applies to active search with zero results, group 3.1 verify
   note). Design's Testing Strategy "Empty state" row.
2. **Skills/Prompts regression check**: confirm both sections load, search, and render item
   cards + modal exactly as before this change — same badge text, same button labels, same
   layout. Design's Testing Strategy "Regression" row; spec's MODIFIED requirement "Skills and
   Prompts sections MUST remain unchanged" (both scenarios).
3. **Header copy**: confirm the search placeholder now reads "Buscar skills, prompts, MCPs...".
4. **Future-proofing / MCP card mock check**: using browser dev tools (or a temporary local
   mock of `fetchItems`/`fetchItemDetail`), inject a fake `type: "mcp"` item with `repo_url` and
   `docs_url` populated, confirm: the card renders (not mislabeled as a Prompt), shows both
   "Repositorio →" and "Documentación →" links pointing to the right URLs, shows "Copiar prompt
   de instalación" as the button label, and opening the modal shows badge "MCP" plus the same
   links. Design's Testing Strategy "Future-proofing" row; this is the concrete verification for
   2.1's and 2.2's MCP-specific scenarios that couldn't be checked with real data.
5. **Global search still fans out to MCPs**: type a search term in the header, confirm the MCPs
   section re-fetches (`GET /items?type=mcp&q=...` in the network tab) same as Skills/Prompts,
   and shows the generic "Sin resultados para tu búsqueda." message (not the "Todavía no hay
   MCPs publicados" empty state) since a query is active. Spec scenario: "No results for an
   active search query."
**Depends on**: 6.1 passing first (no point manually walking through a build that doesn't
compile).
**Status**: [ ] Not run in this session — this environment has no interactive browser/`npm run
dev` walkthrough capability. Verified equivalently via static code review instead: (1) empty-state
JSX confirmed correct and reachable, (2) skill/prompt branches confirmed byte-for-byte preserved,
(3) Header copy confirmed updated, (4) MCP link/badge/label JSX confirmed structurally correct
against the design's link-block spec, (5) `CatalogSection`'s existing fetch effect is untouched so
the query-driven refetch behavior is inherited unchanged for `type="mcp"`. Recommend the user run
`npm run dev` and walk through steps 1-5 themselves before merging, particularly step 4's live
MCP-mock-data check.

## Review Workload Forecast

- **Files touched**: 7 (`src/types/item.ts`, `src/app/page.tsx`, `src/components/HomeClient.tsx`,
  `src/components/CatalogSection.tsx`, `src/components/ItemCard.tsx`,
  `src/components/ItemModal.tsx`, `src/components/Header.tsx`) — matches design's File Changes
  table exactly (0 created, 0 deleted, 7 modified). No task in this breakdown introduces an 8th
  file or a new component.
- **Estimated changed lines**: roughly 60-90 lines total across all 7 files (mostly additive:
  +2 fields to a type, +1 Promise.all branch + 1 prop thread, +1 CatalogSection block, +2 local
  const lookups + 2 link blocks in ItemCard/ItemModal, +2 lines in Header). Well under the
  400-line chained-PR threshold.
- **400-line budget risk**: Low.
- **Chained PRs recommended**: No.
- **Decision needed before apply**: No — the cached `single-pr` delivery strategy remains
  appropriate; proceed directly to `sdd-apply` with this task list as one PR.
