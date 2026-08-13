# Delta Spec: MCPs catalog section

## ADDED Requirements

### Requirement: The page MUST render an MCPs catalog section
The single-page app SHALL render a third catalog section for `type: "mcp"`
items, using the existing `CatalogSection` component (`<CatalogSection
type="mcp" ... />`), alongside the existing Skills and Prompts sections and
before the static Harnesses section. No new fetch, loading, or error logic is
introduced — the MCPs section reuses `CatalogSection`'s existing state
machine (`loading` / `error` / `ready`) unchanged.

#### Scenario: MCPs section shows a loading state before data arrives
- **GIVEN** the MCPs section has not yet received a response from
  `GET /items?type=mcp`
- **WHEN** the section is rendered
- **THEN** it shows the same skeleton loading grid used by Skills and Prompts

#### Scenario: MCPs section shows an error state on fetch failure
- **GIVEN** `GET /items?type=mcp` fails (network error or non-2xx response)
- **WHEN** the section renders the result
- **THEN** it shows the shared error banner with a Spanish error message,
  identical in behavior to the Skills/Prompts error state

#### Scenario: MCPs section shows populated cards when items exist
- **GIVEN** `GET /items?type=mcp` returns `count > 0` with a non-empty
  `items` array
- **WHEN** the section renders the result
- **THEN** it shows one `ItemCard` per returned item in the same responsive
  grid layout used by Skills and Prompts

#### Scenario: MCPs section reacts to the shared global search query
- **GIVEN** the user types a search term in the header search input
- **WHEN** the debounced query value changes
- **THEN** the MCPs section re-fetches `GET /items?type=mcp&q=<query>` and
  updates its rendered state, using the same debounce/refetch behavior
  already implemented for Skills and Prompts (no MCPs-specific search logic)

### Requirement: The empty MCPs section MUST render an intentional, non-error empty state
When `GET /items?type=mcp` returns `count: 0` and no search query is active,
the section SHALL render a dedicated empty-state message — "Todavía no hay
MCPs publicados" — mirroring the existing Prompts empty-state pattern. This
is the expected state for this ship (no backend MCP content exists yet), not
an error condition and not an accidental blank gap.

#### Scenario: Empty MCPs section without an active search query
- **GIVEN** `GET /items?type=mcp` returns `{ count: 0, items: [] }`
- **AND** no search query is active (`query.trim().length === 0`)
- **WHEN** the MCPs section renders
- **THEN** it shows the message "Todavía no hay MCPs publicados" styled the
  same way as the existing Prompts empty state, not the generic
  "no results for your search" message and not an error banner

#### Scenario: No results for an active search query
- **GIVEN** `GET /items?type=mcp&q=<term>` returns `{ count: 0, items: [] }`
- **AND** a search query is active (`query.trim().length > 0`)
- **WHEN** the MCPs section renders
- **THEN** it shows the generic "Sin resultados para tu búsqueda." message,
  consistent with how Skills and Prompts already handle a no-results search

### Requirement: `page.tsx` MUST server-render initial MCPs data alongside Skills and Prompts
The Server Component `page.tsx` SHALL fetch the initial MCPs listing
(`GET /items?type=mcp`) in the same parallel `Promise.all` used for the
initial Skills and Prompts listings, and pass the result as an
`initialMcps: ItemSummary[] | null` prop through `HomeClientProps` into
`HomeClient`, following the same null-fallback pattern already used for
`initialSkills`/`initialPrompts` when `registry-api` is unreachable at
request time.

#### Scenario: Initial page load includes server-rendered MCPs data
- **GIVEN** `registry-api` is reachable at request time
- **WHEN** `page.tsx` renders the initial response
- **THEN** the HTML response includes the initial MCPs listing without
  requiring an additional client-side fetch on first paint (mirroring
  existing Skills/Prompts SSR behavior)

#### Scenario: `registry-api` unreachable at request time
- **GIVEN** `registry-api` is not reachable when `page.tsx` runs
- **WHEN** the initial MCPs fetch fails
- **THEN** `initialMcps` is `null`, and `HomeClient`/`CatalogSection` fall
  back to client-side fetching and error handling, identical to the existing
  fallback behavior for Skills and Prompts

## MODIFIED Requirements

### Requirement: Skills and Prompts sections MUST remain unchanged
Adding the MCPs section SHALL NOT alter the visual appearance, fetch
behavior, loading/error/empty states, or search behavior of the existing
Skills and Prompts sections.

#### Scenario: Skills section behavior is unaffected
- **GIVEN** the MCPs section has been added to the page
- **WHEN** the Skills section loads, errors, searches, or renders results
- **THEN** its behavior and appearance are identical to before this change

#### Scenario: Prompts section behavior is unaffected
- **GIVEN** the MCPs section has been added to the page
- **WHEN** the Prompts section loads, errors, searches, or renders results
  (including its own existing empty state)
- **THEN** its behavior and appearance are identical to before this change
