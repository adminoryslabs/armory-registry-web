# Proposal: MCPs catalog section in registry-web

## Intent

Add a third catalog section — MCPs — to the registry-web single-page app, alongside the
existing Skills and Prompts sections. Users should be able to discover MCP entries
(name, description, tags, a link to the official repo, a link to docs, and a "Copiar prompt
de instalación" button) through the same search, loading, error, and empty-state UX
already established for Skills and Prompts. No new interaction pattern is being introduced —
this is an extension of an existing, proven pattern (`CatalogSection` + `ItemCard` +
`ItemModal` + `CopyButton`), not a new subsystem.

Why now: `adminoryslabs-skills` and `registry-api` are adding a third content type (`type:
mcp`) to the catalog contract. registry-web is the discovery surface for the whole
ecosystem, so it needs to render that type correctly — both in the grid and in the detail
modal — as soon as the type exists, even before real MCP content ships.

## Scope

### In scope

1. **`ItemType` and shared item types** (`src/types/item.ts`): add `"mcp"` to the `ItemType`
   union; add optional `repo_url?: string` and `docs_url?: string` to `ItemSummary` /
   `ItemDetail`, matching the `registry-api.md` contract (nullable, populated only for
   `type: "mcp"` rows, same pattern already used for `install_command` on skills).

2. **New MCPs section on the page**: `<CatalogSection type="mcp" />`, reusing
   `CatalogSection.tsx` as-is for fetch/loading/error handling — no new fetch logic needed,
   `type` is already a prop. Placement: alongside Skills/Prompts, before the static
   Harnesses section (exact ordering relative to Skills/Prompts is an open question, see
   below).

3. **Empty state for MCPs** in `CatalogSection.tsx`: add a `type === "mcp" && !hasQuery`
   branch mirroring the existing Prompts case, message "Todavía no hay MCPs publicados".
   This is the expected default state for this ship (see Interim constraint below), not an
   edge case — it must look intentional, not broken.

4. **Fix the binary type-branch in `ItemCard.tsx` and `ItemModal.tsx` (required, not
   optional)**. Both files currently do `item.type === "skill" ? A : B`, which was written
   assuming exactly two types. Left unfixed, `type: "mcp"` items will silently render as
   "Prompt": wrong button label, wrong badge text in the modal, and — critically — **no
   `repo_url`/`docs_url` links rendered at all**, which is a core requirement of the MCP
   card per the input spec. This must become a real 3-way branch (or an early
   `type === "mcp"` special case ahead of the skill/else check) in both files. Without this
   fix, adding the MCPs section produces visibly broken/incorrect cards — this is not
   deferrable polish, it is required for the feature to work as specified.

5. **`CopyButton.tsx` reuse, unchanged**: the MCP "Copiar prompt de instalación" button uses
   the exact same `getText={async () => (await fetchItemDetail(item.name)).body}` pattern
   Prompts already use. No changes to `CopyButton.tsx`.

6. **`page.tsx` SSR wiring**: widen `loadInitial`'s type param from `"skill" | "prompt"` to
   include `"mcp"` (or just use `ItemType`), add a third parallel call inside the existing
   `Promise.all([...])`, and thread a new `initialMcps: ItemSummary[] | null` prop through
   `HomeClientProps` and into `HomeClient.tsx`.

### Possibly in scope (flagged for design, see Open questions)

7. **`Header.tsx` copy update**: search placeholder currently reads "Buscar skills,
   prompts..." (plus sr-only label "Buscar skills y prompts"). This is a real UX
   inconsistency once MCPs exist in the catalog, and the fix is a one-line copy change with
   no logic impact — recommend including it in this same PR since it is trivial and directly
   caused by this change, but leaving the final call to `sdd-design`/user since it wasn't in
   the original input spec.

### Out of scope

- Any change to `registry-api` or `adminoryslabs-skills` (this proposal covers registry-web
  only; the backend `type: mcp` support and MCP content are tracked as sibling work in those
  repos and are a **dependency**, not a deliverable, of this change).
- A dedicated `McpCard.tsx` component. Exploration confirmed `ItemCard.tsx`/`ItemModal.tsx`
  can be extended in place with a 3-way branch; introducing a parallel component would
  duplicate the grid/modal chrome for no benefit.
- Any new search input or filter UI specific to MCPs — the existing shared global-search
  pattern (debounced `query` state in `HomeClient`, fanned out to each `CatalogSection`)
  already covers this.

## Interim constraint: no live backend data yet

`registry-api` has not yet implemented `type: mcp` (no path recognition, no
`repo_url`/`docs_url` columns) and `adminoryslabs-skills` has no MCP content yet. This
proposal does not block on that work landing first. The section ships safely against this
gap because:

- `GET /items?type=mcp` already returns a well-formed `{count: 0, items: []}` today with zero
  backend changes (the API's `type` filter is generic, not type-specific), so the section
  renders its intended empty state ("Todavía no hay MCPs publicados") rather than an error or
  a broken UI — the same pattern Prompts used at its own initial ship.
- Once `registry-api` and `adminoryslabs-skills` ship real MCP content, the section starts
  rendering real cards with no further registry-web changes required — the type-branch fixes
  in item 4 above are what make that "just work" the moment real data appears, rather than
  silently mislabeling MCP cards as Prompts.

## Size / complexity estimate (for single-PR delivery strategy validation)

Files touched, per exploration:

| File | Change |
|---|---|
| `src/types/item.ts` | add `"mcp"` to `ItemType`, add 2 optional fields |
| `src/app/page.tsx` | widen `loadInitial` type param, add 3rd `Promise.all` call, thread `initialMcps` prop |
| `src/components/HomeClient.tsx` | accept `initialMcps`, render 3rd `<CatalogSection type="mcp" />` |
| `src/components/CatalogSection.tsx` | add `type === "mcp"` empty-state branch |
| `src/components/ItemCard.tsx` | binary → 3-way type branch, add repo_url/docs_url links |
| `src/components/ItemModal.tsx` | binary → 3-way type branch (badge label + CopyButton choice), add repo_url/docs_url links |
| `src/components/Header.tsx` (possibly) | 1-line copy change (placeholder + sr-only label) |

No new component files are strictly required. All changes are localized, mechanical
extensions of an existing pattern (widen a union type, add a branch, add a prop) rather than
new logic. This is a small-to-medium single-file-scope diff across ~6-7 files — well within a
reasonable single-PR budget. **Flag for reconsideration only if** `sdd-design` decides
`ItemCard`/`ItemModal` need a heavier refactor (e.g. extracting a per-type renderer
component) rather than an in-place 3-way branch — that would meaningfully increase diff size
and could justify revisiting the single-PR call. Current estimate does not require that.

## Open questions for sdd-design

1. **Exact section order**: Skills, Prompts, MCPs — in what order do they appear on the page
   relative to each other (before Harnesses in all cases)? Input spec left this
   unspecified/deferred to design.
2. **Header.tsx copy update**: confirm whether to include the placeholder/sr-only label copy
   fix in this same PR (recommended, trivial) or defer it to a separate follow-up.
3. **ItemCard/ItemModal branch style**: in-place 3-way `if/else` (matches existing code
   style, smallest diff) vs. extracting a small per-type config/lookup object. Exploration
   recommends in-place branching to keep the diff minimal per the size estimate above; design
   should confirm or override.

## Success criteria

- `GET /items?type=mcp` with no backend changes renders a correctly labeled empty MCPs
  section, not an error state and not a silently-empty gap.
- Once real `type: mcp` data exists (post backend work), MCP cards render with correct
  badge/button label and both `repo_url`/`docs_url` links, without any further registry-web
  code changes.
- Skills and Prompts sections are visually and functionally unchanged by this work.
