# Delta Spec: Shared item types (`src/types/item.ts`)

## ADDED Requirements

### Requirement: `ItemType` MUST include `"mcp"`
The `ItemType` union SHALL include `"mcp"` alongside the existing `"skill"` and
`"prompt"` values, so all consumers of `ItemType` (component props, fetch
helpers, type guards) can represent MCP catalog entries without a cast or
`any`.

#### Scenario: Type-checking a component with `type="mcp"`
- **GIVEN** a component prop typed as `ItemType`
- **WHEN** the value `"mcp"` is assigned to it
- **THEN** TypeScript compilation succeeds with no type error

### Requirement: `ItemSummary` and `ItemDetail` MUST carry optional MCP link fields
`ItemSummary` (and by extension `ItemDetail`, which extends it) SHALL declare
optional fields `repo_url?: string` and `docs_url?: string`, matching the
`registry-api` contract where these fields are populated only for `type:
"mcp"` rows and are `undefined`/absent for `"skill"` and `"prompt"` rows.

#### Scenario: Skill/Prompt item without link fields still type-checks
- **GIVEN** an `ItemSummary` object of `type: "skill"` or `type: "prompt"`
  with no `repo_url`/`docs_url` keys present
- **WHEN** it is used anywhere `ItemSummary` is expected
- **THEN** TypeScript compilation succeeds (the fields are optional, not
  required)

#### Scenario: MCP item with both link fields type-checks
- **GIVEN** an `ItemSummary` object of `type: "mcp"` with
  `repo_url: "https://github.com/..."` and `docs_url: "https://docs.example.com"`
- **WHEN** it is used anywhere `ItemSummary` is expected
- **THEN** TypeScript compilation succeeds and both fields remain accessible
  as `string`
