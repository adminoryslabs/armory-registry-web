# Delta Spec: ItemCard and ItemModal type-aware rendering

## MODIFIED Requirements

### Requirement: `ItemCard` and `ItemModal` MUST branch on all three item types, not just `skill` vs. non-skill
`ItemCard.tsx` and `ItemModal.tsx` currently implement a binary check
(`item.type === "skill" ? A : B`), which silently treats any non-skill type
— including `"mcp"` — as if it were `"prompt"`. Both components SHALL be
updated to branch explicitly on all three `ItemType` values (`"skill"`,
`"prompt"`, `"mcp"`), so that `type: "mcp"` items render their own correct
badge/button/link content instead of being mislabeled as prompts.

This is a required correctness fix, not new feature surface: without it, the
MCPs section (see `mcp-catalog-section` spec) would render cards with wrong
button labels and, critically, without the `repo_url`/`docs_url` links that
are a core part of what an MCP card must show.

#### Scenario: MCP item in `ItemCard` does not fall through to the Prompt branch
- **GIVEN** an `ItemSummary` with `type: "mcp"`
- **WHEN** `ItemCard` renders it
- **THEN** it does NOT render the skill "Copiar comando de instalación"
  button and does NOT render the generic "Copiar prompt" button used for
  plain prompts — it renders MCP-specific content per the requirements below

#### Scenario: MCP item in `ItemModal` shows an "MCP" badge, not "Prompt"
- **GIVEN** an `ItemSummary`/`ItemDetail` with `type: "mcp"`
- **WHEN** `ItemModal` renders its header badge
- **THEN** the badge text reads "MCP" (not "Skill" and not "Prompt")

#### Scenario: Skill and Prompt rendering is unchanged after introducing the 3-way branch
- **GIVEN** an item of `type: "skill"` or `type: "prompt"`
- **WHEN** `ItemCard` or `ItemModal` renders it
- **THEN** the rendered badge, button label, and button behavior are
  byte-for-byte equivalent to the pre-change binary-branch behavior

## ADDED Requirements

### Requirement: `ItemCard` MUST render `repo_url` and `docs_url` links for MCP items
When `ItemCard` renders an item of `type: "mcp"`, it SHALL render a link to
`item.repo_url` (labeled to indicate "repo") and a link to `item.docs_url`
(labeled to indicate "docs"), each opening the URL, alongside the existing
name/description/tags content. It SHALL also render the "Copiar prompt de
instalación" `CopyButton`, using the same
`getText={async () => (await fetchItemDetail(item.name)).body}` pattern
already used for Prompts — no changes to `CopyButton.tsx` itself.

#### Scenario: MCP card with both links present renders both
- **GIVEN** an `ItemSummary` with `type: "mcp"`, a populated `repo_url`, and
  a populated `docs_url`
- **WHEN** `ItemCard` renders it
- **THEN** both a repo link and a docs link are present and point to their
  respective URLs

#### Scenario: MCP card renders the install-prompt copy button
- **GIVEN** an `ItemSummary` with `type: "mcp"`
- **WHEN** the user clicks "Copiar prompt de instalación" on its card
- **THEN** the button fetches `GET /items/:name` on click, shows loading
  feedback while the request is pending, and copies the returned `body` to
  the clipboard on success — identical to the existing Prompts copy flow

### Requirement: `ItemModal` MUST render `repo_url` and `docs_url` links for MCP items
When `ItemModal` renders the detail view for an item of `type: "mcp"`, it
SHALL render the same `repo_url`/`docs_url` links (sourced from the loaded
`ItemDetail`, or from the initial `ItemSummary` if already present) alongside
the existing description/tags/body content, and SHALL use the
`CopyButton` with the "Copiar prompt de instalación" label bound to
`state.detail.body`, consistent with the Prompts modal flow.

#### Scenario: MCP modal shows links once detail data has loaded
- **GIVEN** the modal is open for an item of `type: "mcp"`
- **AND** `GET /items/:name` has resolved successfully
- **WHEN** the modal renders its `ready` state
- **THEN** it shows the repo link and docs link alongside the item body
