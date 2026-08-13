# Verify Report: MCPs catalog section in registry-web

Date: 2026-08-13
Change: mcp-catalog-section
Verifier: sdd-verify (formal SDD verify step, following an earlier independent fresh-context
gate review that found 0 CRITICAL / 0 WARNING / 1 SUGGESTION after apply)

## Verdict

READY FOR ARCHIVE, with one explicitly deferred gap: task 6.2's live-browser manual
walkthrough was not performed in this session either (no interactive browser available in this
environment, registry-api was not running during the orchestrator's curl check). All
statically verifiable evidence, code inspection, tsc/build, diff inspection, and
SSR-markup curl confirmation for the parts curl can reach, passes with zero CRITICAL and
zero WARNING findings. Nothing found here contradicts or weakens the prior gate review.

## Build / type-check (re-run this session)

- npx tsc --noEmit: clean, zero errors.
- npm run build (Next.js 16 Turbopack): Compiled successfully, Finished TypeScript, static
  generation succeeded, zero errors/warnings.
- git diff --stat: exactly 8 tracked files modified (CLAUDE.md, src/app/page.tsx,
  src/components/CatalogSection.tsx, src/components/Header.tsx, src/components/HomeClient.tsx,
  src/components/ItemCard.tsx, src/components/ItemModal.tsx, src/types/item.ts). The CLAUDE.md
  diff is pre-existing/unrelated documentation drift, not part of this change (matches
  apply-progress's note). The 7 code files match design's File Changes table exactly, no 8th
  code file, no McpCard.tsx.

Both commands were re-run fresh in this session (not reused from apply-progress) and reconfirm
the apply agent's claim; no regressions since apply.

## tasks.md completion status

All 9 tasks (1.1, 2.1, 2.2, 3.1, 4.1, 4.2, 5.1, 6.1) are marked [x] Done and match the code
state confirmed by direct inspection below. Task 6.2 is honestly marked [ ] with an explanation
that the live-browser walkthrough was not run; this is accurate, not overstated completion.

## Requirement-by-requirement verification

Legend: PASS (static) = confirmed by code/build/diff inspection; PASS (SSR markup) =
confirmed by the orchestrator's curl check against rendered HTML; NOT VERIFIABLE HERE =
requires a real browser session with JS execution (task 6.2), not yet performed by anyone.

### Spec: item-types

| Requirement / Scenario | Result | Evidence |
|---|---|---|
| ItemType MUST include "mcp" | PASS (static) | src/types/item.ts:1, union is skill/prompt/mcp |
| Scenario: type-checking type="mcp" | PASS (static) | tsc --noEmit clean across all consumers using the 3-way union |
| ItemSummary/ItemDetail MUST carry optional MCP link fields | PASS (static) | src/types/item.ts:11-12, repo_url? and docs_url?, ItemDetail extends ItemSummary |
| Scenario: skill/prompt without link fields still type-checks | PASS (static) | Fields are optional; existing skill/prompt item literals elsewhere compile unchanged |
| Scenario: MCP item with both link fields type-checks | PASS (static) | Optional string fields accept populated values; build succeeds |

### Spec: item-card-and-modal

| Requirement / Scenario | Result | Evidence |
|---|---|---|
| ItemCard/ItemModal MUST branch on all three types | PASS (static) | Both files use COPY_LABELS: Record<ItemType,string> (3 entries) for the label, plus an explicit item.type === "mcp" link block ahead of the skill/else split. ItemModal additionally uses TYPE_LABELS[item.type] for the badge; no case falls through silently. |
| Scenario: MCP item in ItemCard does not fall through to skill/Prompt buttons | PASS (static) | COPY_LABELS.mcp = "Copiar prompt de instalacion", distinct from skill's and prompt's labels; getText for mcp uses the same async fetchItemDetail path as prompt (by design, documented in design.md's rationale, not a fallthrough bug) |
| Scenario: ItemModal MCP badge reads "MCP" | PASS (static) | TYPE_LABELS.mcp = "MCP", ItemModal.tsx:79 renders TYPE_LABELS[item.type] |
| Scenario: Skill/Prompt rendering unchanged (byte-for-byte) | PASS (static, diff-confirmed) | git diff on ItemCard.tsx/ItemModal.tsx shows the skill branch and prompt branch are structurally untouched; only the literal label strings were replaced by lookups resolving to the exact same strings for skill/prompt. Output is byte-for-byte identical. |
| ItemCard MUST render repo_url/docs_url links for MCP | PASS (static) | ItemCard.tsx:45-68, conditional block gated on item.type === "mcp" and repo_url/docs_url, each link independently gated on its own URL, target=_blank rel=noreferrer, positioned after tags before the CopyButton wrapper, matching design exactly |
| Scenario: MCP card with both links renders both | NOT VERIFIABLE HERE | Structurally correct in code, but no real type: mcp data exists (registry-api does not implement it yet) and no browser session was run to inject mock data; same gap flagged by task 6.2 and the prior gate review's SUGGESTION |
| Scenario: MCP card renders install-prompt copy button | NOT VERIFIABLE HERE (structurally PASS) | getText wiring is code-correct and reuses the exact same tested pattern Prompts already use in production; the click/loading/copy interaction itself needs a live click, not observable via curl or static read |
| ItemModal MUST render repo_url/docs_url links for MCP | PASS (static) | ItemModal.tsx:110-133, identical link-block pattern, sourced from item (the ItemSummary prop) not state.detail, so it renders before the async fetch resolves, exactly as design specifies |
| Scenario: MCP modal shows links once detail loaded | NOT VERIFIABLE HERE | Same as above; code-correct, unconfirmed in a live browser |

### Spec: mcp-catalog-section

| Requirement / Scenario | Result | Evidence |
|---|---|---|
| Page MUST render an MCPs catalog section | PASS (SSR markup + static) | Orchestrator's curl check confirmed section order Skills to Prompts to MCPs to Harnesses in rendered HTML; HomeClient.tsx:48-56 wires CatalogSection id=mcps type=mcp between Prompts and HarnessesSection |
| Scenario: loading state | PASS (static, inherited) | No new state-machine code; CatalogSection's existing loading/error/ready reducer is untouched for the mcp type; only EmptyState's render branch was extended (see below) |
| Scenario: error state | PASS (static, inherited) | Same shared fetch/error path (fetchItems with type and q, plus ApiError catch); no MCP-specific branch was added, confirming no divergence |
| Scenario: populated cards | NOT VERIFIABLE HERE | Requires real type: mcp data from registry-api, which does not exist yet (explicit interim constraint in proposal.md); structurally the same ItemCard mapping used by Skills/Prompts, no new logic |
| Scenario: reacts to shared global search | PASS (static, inherited) | CatalogSection's useEffect refetch on [type, query] change is generic and untouched; MCPs section receives the same debouncedQuery prop as Skills/Prompts in HomeClient.tsx. Live network-tab confirmation (task 6.2 step 5) not performed. |
| Empty MCPs section MUST render intentional empty state | PASS (static) | CatalogSection.tsx:130-142, type === "mcp" and !hasQuery branch added alongside (not replacing) the existing prompt branch, text "Todavia no hay MCPs publicados" matches spec exactly |
| Scenario: empty MCPs section without active query | NOT VERIFIABLE HERE (structurally PASS) | Orchestrator's curl check could not exercise this; registry-api was not running, so the client-side fetch effect that would resolve to count 0 items empty and trigger this branch never ran under curl (curl only sees static SSR HTML from before hydration/fetch). Code path is correct and reachable; needs a real browser with a live or stubbed registry-api to observe. |
| Scenario: no results for active search query | PASS (static, diff-confirmed) | git diff confirms the pre-existing generic "Sin resultados para tu busqueda." fallback was not touched or reordered; the new mcp branch was inserted before it, same pattern as the existing prompt branch, so hasQuery true for mcp still falls through correctly |
| page.tsx MUST SSR initial MCPs data | PASS (static) | page.tsx:26-30, third parallel loadInitial("mcp") call inside Promise.all, destructured as initialMcps, passed to HomeClient |
| Scenario: initial page load includes SSR MCPs data | NOT VERIFIABLE HERE | Requires registry-api reachable at request time with real MCP rows; neither existed during this verify session |
| Scenario: registry-api unreachable at request time | PASS (SSR markup, indirectly confirmed) | The orchestrator's curl check ran against npm run dev with registry-api NOT running; the page still rendered without crashing, which is exactly this scenario's expected behavior (loadInitial's try/catch returns null, HomeClient/CatalogSection fall back to client fetch/error state instead of a 500). This is real evidence the fallback path works, not just code review. |
| Skills and Prompts sections MUST remain unchanged | PASS (static, diff-confirmed + SSR markup) | git diff shows zero structural changes to the skill/prompt branches (see item-card-and-modal section above); orchestrator's curl check independently confirmed header copy and section order without any Skills/Prompts regression in the static markup |
| Scenario: Skills section behavior unaffected | PASS (static) | No CatalogSection, ItemCard, or ItemModal code path specific to type skill was touched; only label-lookup indirection was introduced, resolving to the identical string |
| Scenario: Prompts section behavior unaffected | PASS (static) | Same reasoning; additionally the pre-existing type prompt and not hasQuery empty-state branch in CatalogSection.tsx is untouched, confirmed by diff (new mcp branch inserted after it, not replacing it) |

### Header.tsx copy (design decision, not a numbered spec requirement)

| Item | Result | Evidence |
|---|---|---|
| Placeholder to "Buscar skills, prompts, MCPs..." | PASS (SSR markup) | Header.tsx:24; orchestrator's curl check confirmed exact match in rendered HTML |
| sr-only label to "Buscar skills, prompts y MCPs" | PASS (SSR markup) | Header.tsx:17; orchestrator's curl check confirmed exact match in rendered HTML |

## Summary of what is confirmed vs. deferred

Confirmed (code + build + diff + curl-verified SSR markup):
- All type-level changes (ItemType, ItemSummary/ItemDetail fields); compiles cleanly.
- ItemCard/ItemModal 3-way branching structure, MCP link blocks, label/badge lookups; code
  correct and structurally sound; skill/prompt paths are diff-confirmed byte-for-byte unchanged.
- CatalogSection empty-state branch for MCPs; code correct, existing prompt/generic branches
  diff-confirmed untouched.
- page.tsx/HomeClient.tsx SSR wiring and section placement; code correct; section order
  and Header copy independently confirmed via curl against real rendered HTML.
- registry-api-unreachable fallback; actually exercised (dev server ran with API down,
  page did not crash).
- Full type-check and production build; reconfirmed clean in this session.

Deferred to a real browser session (task 6.2, not yet run by anyone):
- MCP empty-state message actually rendering client-side with a live/stubbed registry-api
  response of count 0 items empty (curl cannot execute the client fetch effect).
- Global search fan-out to the MCPs section (GET /items?type=mcp&q=... in the network tab).
- Mock MCP card/modal walkthrough: badge "MCP", both links, "Copiar prompt de instalacion"
  button, and successful copy-to-clipboard; needs injected mock data since no real type mcp
  content exists yet.

This gap is identical to the one already flagged by both the apply agent (task 6.2 status note)
and the independent gate review's single SUGGESTION; no new gap was found in this verify pass.
It does not block archive: the interim constraint in proposal.md explicitly anticipates shipping
against an empty/no-data backend, and the deferred checks are the same "future-proofing" scenario
proposal.md and design.md already scoped as verifiable only once real backend data or a manual
mock exists.

## Recommendation

Proceed to sdd-archive. Recommend the user (or a follow-up session with real browser access)
run npm run dev and walk through tasks.md's 6.2 steps before merging to main, particularly
step 4 (MCP mock-data card/modal check), since it is the only scenario group with zero direct
observation so far; everything else has either static or SSR-markup evidence.
