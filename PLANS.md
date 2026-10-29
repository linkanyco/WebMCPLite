# WebMCPLite — intent, research, and execution plan

Reference date: 2026-10-25; current direction updated 2026-10-28. The initial implementation and subsequent standard-entry-point correction have historical delivery records below. H33 was delivered in PR #21 and H34/H35 in PR #23. H36/H37's developer guide was delivered in PR #25 ([issue #24](https://github.com/linkanyco/WebMCPLite/issues/24)). H38's README handoff and specification-first extension guidance was delivered in PR #26. H39 clarifies Lite as an approachable start.

## 1. How to read this document

This plan carries a brainstorming discussion into development without mixing sources or inventing authority.

- **H — explicit human intent:** goals, boundaries, preferences, and authorization directly supported by the preserved quotations. Summaries are written by agents; the quotations govern meaning.
- **R — researched facts:** observations supported by linked official drafts, documentation, or source. Preserve the date and limits. A draft API and actual browser/AI support are different.
- **AP — agent proposals:** implementation choices, examples, and sequencing. They may change when evidence warrants it and must not be relabeled as human instructions.

Read the [H01–H40 evidence](docs/sources/human-intent.md), including H38's explicitly bounded excerpts, and [research with limitations](docs/sources/research.md). Summaries do not replace those sources. Confident prior AI answers, existing code, human silence, or a merged PR do not turn AP into H. This plan is not proof that an implementation or verification is complete.

## 2. The problem — agent synthesis of H

People work in operational websites and would like to ask their existing AI for help while seeing and continuing the changes on the same screen. The website can describe its data and available actions instead of requiring repeated interpretation of the entire DOM.

A separate hosted chatbot, model service, voice-recognition system, or browser controller is not a prerequisite. Voice and alternating control describe a desired experience, not new infrastructure WebMCPLite must build. Shared human–AI editing matters alongside higher levels of automation.

**WebMCPLite** is a practical companion to the existing WebMCP draft: small development conventions, a consumer harness, a registration helper, and runnable examples. H33 clarifies the motivation: the author began with a personal need, found an existing specification, and wants to help others with similar needs use it easily. Do not claim a competing protocol, official affiliation, certification, unique invention, or universal support.

## 3. Explicit scope and boundaries — agent summary of H

### 3.1 Deliverables

- Product principles and development conventions.
- **Development guidelines and an AGENTS.md harness** for workers/reviewers building new WebMCP-friendly screens or adapting existing ones (H36/H37).
- Small common connecting code and understandable app-level contracts.
- **5–6 runnable examples**. Single-product and bulk editors are explicit starting requests; selection of the remaining examples is AP.
- Simple object-oriented reads and edits such as `getBoard`/`setBoard` or the historical `get_sheet`/`set_sheet` illustration, instead of automatically adding a verb per field.
- Discoverable site/page guidance and a site map. The human suggested `site_map`; exact `site_manual`/`page_manual` names and response formats are AP.
- Save, cancel, navigation, and asynchronous actions available through clear functions.
- Authorized related-object reads beyond details currently displayed in a preview (H29), and shared functions or thin wrappers for UI and tool updates. Twig/Liquid were implementation ideas, not mandated technologies.
- Visible marks for AI changes, with a control to hide the marks.
- Unsaved-state queries covering **all editing areas checked when leaving the current page** (H17), not every record on a server.
- Under H33, English current site/documentation, no example revision counters, generic SKU/product-code data, and an Ant Design gallery with the LobeHub theme.

### 3.2 Future possibilities

Complex hidden filters were excluded from the initial examples. H34 now authorizes a small SKU/price search in the UI followed by read-only stock questions about its current results. More advanced searches remain future work; all data access must stay within ordinary app authorization.

Historical discussion included filling product fields from a PDF. That does not require a PDF parser, uploads, OCR, or model hosting in the Lite core. H33 removes fashion-specific presentation from current examples.

### 3.3 Excluded scope

Do not redesign the ERP, real customer data storage, existing Product Import APIs, variant creation, product/image ordering, image migration, or transaction ownership. Do not add a hosted chatbot, AI-provider keys, a general agent runtime, or a new MCP transport. Do not claim a polyfill creates native browser support.

Initial delivery excluded deployments and package publishing. H31 subsequently authorizes **only this repository's fictional GitHub Pages gallery**, including automatic deployment from main. Other servers, real data, and npm publishing remain outside authority.

## 4. Minimal approach — AP, updated by later H

### AP-01: Two audiences for manuals

Development AGENTS.md tells **AI building a site** what to connect and verify. Runtime manuals tell **AI using that site** what it can read, edit, save, and navigate. Do not copy this repository's operating policy wholesale into a consumer harness.

### AP-02: One standard runtime entry point

**Current, under H32/H33:** register, discover, and invoke through `document.modelContext`. Manuals and site maps are registered tools. Browser agents use browser discovery/invocation; in-page JavaScript requires implemented `getTools()`/`executeTool()` APIs. Detect these separately and keep ordinary UI working when unavailable.

**Historical, superseded by H32:** the early AP proposed shared definitions for both native registration and a public JS list/call fallback with a short metadata/DOM entry guide. It mentioned `#agentsmd`/`#llms` without treating them as official APIs. That proposal was implemented in the early examples, then removed. It is not current guidance or a prior human decision to create a second protocol.

### AP-03: Minimal get/set semantics

Read copies of the current editable data. Validate allowed fields and use the same actions as UI, including authorized related-object getters. The example choice is **partial patch → shared draft and visible UI → separate save**. Clearly define omitted fields, null, arrays, invalid values, and read-only fields; do not build a universal state engine or schema DSL.

Under H36, structure ordinary app get/set/save actions first, reused by API loading, payload composition, UI and WebMCP. A correctly scoped existing collection can be read by a registered callback without adding an app getter solely for WebMCP. This does not turn an ordinary variable into a second public discovery protocol.

### AP-04: Visible shared editing

UI and AI enter the same validation/state path. Mark actual AI changes and reflect human continuation, save, and cancel. **H33 removes the example revision/expectedRevision mechanism.** It was an agent choice for detecting stale writes, never a WebMCP requirement. Real apps retain whatever concurrency guarantees their own server requires; the gallery does not add that mechanism.

### AP-05: Actions and authority

Distinguish draft edits, requested persistence, confirmed save, failure, and cancellation. Keep existing app permissions and audits. Where real confirmation is required, tie it to a concrete proposal and do not reuse stale approval after edits.

The examples let people inspect drafts and explicitly save them. H23 also allows more automation when the app/user permits it; do not impose a new universal confirmation dialog on every setter.

H36 clarifies the minimal runtime guidance: requests to edit/change stop at setters; saving requires an explicit user request within host permissions and confirmation policy. Keep the prompt simple. Reuse existing save/recovery behavior rather than adding WebMCP-specific undo, confirmation or recovery machinery.

### AP-06: Small manuals

Use a short site map for pages/URLs/purposes, common guidance for shared concepts, and a page manual for current tools and workflows. Static same-origin JSON is enough for these examples; do not add an LLM, search engine, or vector database just to retrieve guidance.

## 5. Initial six examples — historical AP selection, superseded by H34

1. **Product editor:** get/set, human and AI edits, marks, save/cancel.
2. **Bulk catalog:** multiple rows, atomic validation, human continuation in the same table.
3. **Selection sheet:** fictional rows, order and quantity; get related products and switch the display between SKU and product code. No real ERP pricing/inventory integration.
4. **Board:** use understandable get/set on a non-product entity.
5. **Manuals and navigation:** find a page, inspect two editing areas, and handle unsaved changes before leaving.
6. **Asynchronous save recovery:** controlled delay, validation/failure, retained draft, retry, and confirmed outcome. Do not invent a complex partially successful backend.

Examples 1–2 were explicit requests. The historical sheet idea followed the original domain; H33 now requires neutral products and identifiers. Examples 4–6 are agent selections. Replace AP choices if a smaller set teaches the purpose better; H34 replaces these examples as described in §15.

## 6. GitHub execution authority and workflow

H27 explicitly authorizes reading this plan, creating planning issues, implementing through PRs, repeated fresh-context direction reviews, and direct merges **for WebMCPLite only**. H28 says the project already exists. Reuse the existing repository and execution chat; do not duplicate them. H31 separately adds Pages publishing.

1. Read original H, current R, and AP. Check existing work, then create useful issues with index links and dependency order.
2. Implement reviewable `codex/` branches and PRs; inspect actual code and behavior.
3. Review the entire final change in a fresh session that does not inherit the author's conversation. Check correctness and whether the design is unnecessarily large.
4. After fixes, validate the changed final commit and obtain another fresh-context review. Merge only with required passing checks and no important unresolved defect. Never bypass checks or protection.
5. Continue dependent work. Reconsider direction at milestones without endless redesign. Ask only about genuine conflicts with H or missing authority.
6. When scope is fulfilled, report required work, limitations, and future ideas separately. Resume the original chat/issues after interruption instead of creating replacement tasks.

Early candidate work units covered terminology, harness, contracts, helper, six examples, browser verification, and final documentation. These were proposals rather than proof issues already existed. The actual delivered issue/PR mapping is in [progress](docs/progress.md).

## 7. Evidence for completion — AP execution criteria

- Explain the separate development harness and runtime manual audiences and how to integrate each.
- Keep rules and code consistent; UI/AI use shared app actions.
- Reproduce 5–6 examples with discoverable inputs, visible changes, and honest save state.
- Verify AI marks, display controls, page-wide unsaved state, meaningful contracts, and actual browser editing.
- Separate stub tests from observed browser WebMCP calls; expose unsupported and unrun areas.
- Record fresh-context review of the exact final commit, required checks, linked issues, and merged PRs.
- Make README describe actual behavior and support, without substituting marketing or novelty claims for evidence.

## 8. Direction review prompts — AP

Does this recreate WebMCP registration? Is the value clear in small conventions and easy-to-follow examples? Are get/set contracts clear rather than unrestricted JSON? Does each dependency solve an actual example need? Do manuals agree with behavior without duplicated metadata drifting? Can a person see AI changes and continue editing consistently? Is automation consistent with user authority? Are overlaps with existing projects acknowledged without claims of being first, official, or universally compatible?

## 9. Public sources and private experiments

Private single/bulk editing experiments preceded this repository. They explored fictional data, shared drafts, marks, review/save, recovery, and optional registration. They are historical observations, not proof of this public implementation or browser compatibility.

Do not copy private code, actual product data, screenshots, documents, internal links, or local private paths. Write independent fictional public examples. Check rights, attribution, and licenses before reusing code. A public repository alone is not a reuse license.

## 10. Historical execution choices

The human designated this chat as the execution place:

```text
아 내 이야기는 코덱스에 프로젝트 넣어놨으니 거기서 진행시키라고.. 그래야지 작업이 분리가 되니
```

The existing public repository was empty at the first check. It was reused.

- **Historical AP stack, superseded by H33:** browser ES modules and Node built-in tests/static server, initially no build step or runtime dependencies. H33 explicitly selects a UI library/theme; the current gallery uses React, Ant Design, LobeHub UI and Vite while the reusable helper stays independent.
- **Historical AP contracts:** allowed-field patches, omitted-field retention, explicit array replacement, null rejection, separate save/cancel. Those meanings remain. Revision-based conflict checks were AP and are removed under H33.
- **Save model, still current:** tab-memory baselines reset on reload, with simulated delay/failure for async examples; no server persistence.
- **Historical work units:** contracts/harness, helper/tests, product/bulk/sheet, board/manuals/async, browser verification/final docs. Shared gallery work was combined into one PR; the helper and final documentation stayed separate. This adjusted AP sequencing, not H.
- **License, unresolved:** no reuse license selected by the human. Viewing/running does not grant redistribution or publishing permission.

## 11. Initial delivery — historical record

Contracts/harness PR #12, registration helper PR #13, and six examples PR #14 were merged after required validation and fresh-context final-commit reviews. Documentation and verification followed. [Walkthroughs](examples/README.md), [verification](docs/verification.md), [reviews](docs/reviews/README.md), and [progress](docs/progress.md) retain the trace.

The initial helper was a 47-line ES module and the initial suite had 14 tests. IAB discovery/invocation was observed without determining engine/version or generalizing to other browsers. No real persistence, authorization backend, production service, or package publishing was added. Hidden search, PDF processing, hosted chat, and a general agent platform stayed future/out-of-scope. That initial scope ended; later human requests are tracked as follow-ups.

## 12. GitHub Pages — H30/H31

H30 asked how repository examples could run at a public URL; H31 explicitly requested publishing. This adds only the fictional GitHub Pages gallery to the original scope.

AP delivery uses main push → tests → static build → Pages deployment. PRs test/build without publishing. Assets, manuals, and site-map paths support the repository subpath. Publish runtime assets only, not the whole repository. The public address is `https://linkanyco.github.io/WebMCPLite/`.

The site shows the **last successfully deployed main commit**. A new merge takes time to deploy; failure leaves the previous successful deployment visible. The footer and `version.json` identify the full commit. This deployment identifier is unrelated to the removed editing revision counter. Save remains tab memory. See [issue #16](https://github.com/linkanyco/WebMCPLite/issues/16) and linked PR #17.

## 13. Single standard entry point — H32

[H32](docs/sources/human-intent.md) and [issue #18](https://github.com/linkanyco/WebMCPLite/issues/18) replace parallel HTML metadata/markers and `window.webmcpLite.list/call` with `document.modelContext`. Keep the developer/consumer harness and registered manual tools. Preserve the old proposals and observations as historical records.

The helper returns only ready/dispose. Ordinary UI uses shared app actions. The in-page demo calls standard getTools → executeTool, returns JSON values from callbacks, and parses the platform's result string once. Registration expiry must not cancel an already running call; execution cancellation uses its execution signal. Registration failure and missing in-page support are distinct; only unavailable AI controls disable. No polyfill or transport was added.

The earlier revision question did not authorize a change during H32. H33 now explicitly removes that example mechanism.

## 14. English gallery and simpler contracts — H33, delivered

[H33 verbatim evidence](docs/sources/human-intent.md) and [issue #20](https://github.com/linkanyco/WebMCPLite/issues/20) require continued WebMCP alignment, the README's personal motivation and practical purpose, removal of revision counters, English site/documentation, an entirely renewed Ant Design UI with the LobeHub theme, and neutral SKU/product-code examples.

**Supersession:** H33 replaces the historical revision API, fashion-oriented sample terminology, Korean current documentation/site copy, and no-build/no-runtime-dependency gallery AP. Original human quotations stay in their original Korean; historical proposals and observations remain explicitly historical.

**AP implementation:** use React with Ant Design and the compatible `@lobehub/ui` ThemeProvider; use Vite for development and static bundling. This UI stack does not enter `src/connect.js`. Product fields are `id`, `sku`, `productCode`, `name`, `price`, `description`; sheet `codeType` selects `sku` or `productCode`. Setters, save, and cancel have no expected-revision input. Keep existing validation, shared state, marks, atomic bulk edits, async recovery, and unsaved-page guards.

The user will test after delivery. Required automated checks, actual browser observations, fresh-context final-SHA review, merge, and public deployment must be recorded as they happen in the issue/PR; this section does not claim those steps have already passed.

## 15. Administrator tutorials and welcome page — H34/H35, delivered in PR #23

[H34/H35 evidence](docs/sources/human-intent.md) and [issue #22](https://github.com/linkanyco/WebMCPLite/issues/22) define one ordinary ecommerce store administrator, six tutorials, a welcome page, and a supporting New product destination. H34 supersedes the selection-sheet, board-note, two-note guide and save-recovery AP examples. H35 allows Korean site UI while keeping English as the default; repository documentation remains English.

Human-selected scenarios: polish deliberately poor English copy and fill a separate Korean description; discount every SKU starting with KEY-1; search SKU containing KEY and price ≤ $20, then read stock ≤ 5 only in current results; edit three category banners as HTML/CSS in an upper Textarea and render a lower Preview; find a light project-information page through manuals; read a product and recreate it in a new tab through remembered data. No duplicate feature or uniqueness constraint is needed. AI highlights start on and can be hidden through a tool, without a UI switch. The prompt sits in a cartoon-like upper region; below it is ordinary app UI. Developer tools live in a separate tab.

AP choices: keep legacy route IDs for shared links; use 12 fictional products (eight KEY-1 matches, six KEY/≤$20 results, four of those with stock ≤5), descriptionEn/descriptionKo fields, and a local newProduct draft. getProducts on the list reads current search results including read-only stock; setSearch uses visible UI filters. Storefront source renders only on Preview in a script-disabled sandbox. Tabs have independent memory; the browser AI carries values and opens the destination tab using browser controls. No cross-tab protocol or hidden storage transfer. Landing discovery copy describes required browser/AI support honestly; it cannot enable missing support. Generated banner assets are stored with the example. UI language switching changes copy and document language without editing drafts.

Verify meaningful contracts, actual browser edits/previews and multi-tab reuse, both UI languages, desktop/mobile layout, final-SHA independent review and Pages deployment. Report observed support separately from automated stub tests.

## 16. Portable developer guidelines — H36/H37, delivered in PR #25

[H36/H37 evidence](docs/sources/human-intent.md) and [issue #24](https://github.com/linkanyco/WebMCPLite/issues/24) emphasize two deliverables: the example site and development guidelines. The current work improves guidance so a worker/reviewer can understand how to build a new WebMCP-friendly screen from a small Markdown handoff. Downstream integration and possible gallery removal are not part of this documentation task.

Human direction: structure ordinary app functions for reuse rather than adding WebMCP-only business logic; separate draft setters from save; require an explicit save request in simple runtime guidance; permit direct reads of existing authorized data without a mandatory extra getter layer; avoid investing in elaborate prompts or new undo/recovery machinery. H32's standard entry point and host authority still apply.

AP delivery: one self-contained `docs/development-guidelines.md`, a compact consumer harness, clear README entry points and gallery-contract boundaries. Use independently written fictional wiring examples for API loading, UI edits, tool registration and authorized detail reads, with proportionate worker/reviewer checks. Documentation remains English under H33. Do not copy private target code or modify another repository. Verify links and illustrative snippets with injected app functions, run required CI, and obtain fresh-context review of the final commit before merge; do not claim target-app or new browser validation from documentation checks.

## 17. README handoff and Lite scope — H38

[H38 evidence](docs/sources/human-intent.md) follows issue #24/PR #25 and the index issue #1. Add a direct instruction for development AI/workers/reviewers to follow the guide, link the existing WebMCP draft alongside the personal motivation, and consult/reuse equivalent standard behavior before extending functionality. Keep that last principle in the portable guide as well.

AP direction assessment: the adoption scope remains small and the dependency-free connector is optional; the human-selected React/Ant Design/LobeHub gallery has separate UI dependencies. Explain this boundary rather than claim the whole website has a minimal bundle. No runtime/UI-stack change or new feature is requested. Validate document links, obtain final-commit fresh-context review and passing CI, and record merge evidence on the follow-up PR.

## 18. An approachable start — H39

[H39 evidence](docs/sources/human-intent.md) keeps the WebMCPLite name and defines its intended tone as “start simply,” consistent with the cartoon tutorials. Add the practical development-guide/working-example introduction and explain that naming intent in README. This is a documentation follow-up to merged PR #26 and issue #24/index #1; PR #26 cannot accept additional commits after merge. Preserve the existing specification alignment, host authority and honest gallery-dependency boundary. No runtime or gallery layout change is needed. Record final-commit independent review and CI on the follow-up PR.

## 19. Ordinary file inputs and runtime guidance — H40

[H40 evidence](docs/sources/human-intent.md) and [issue #28](https://github.com/linkanyco/WebMCPLite/issues/28) request specification research first, then a practical alternative to passing file content through a base64 setter. The human proposes describing the ordinary file input, multiplicity, formats, related fields and usage in initial AI guidance if the standard has no suitable transfer mechanism. The `setFile` wording is a report of an earlier app approach, not an official API or a claim about assigning `input.value`.

R: the 27 October WebMCP draft defines JSON tool inputs, without a file/reference transfer contract or fixed 2 MB file limit. Browser attachment capabilities are a separate layer. Current official OpenAI documentation says built-in-browser automatic uploads and declarative WebMCP forms are unsupported. These observations must not become universal client limits; see [research](docs/sources/research.md).

AP: extend the portable guide and compact harness, and describe file inputs through existing registered manuals. Add optional PDF/PNG/JPEG reference files to the supporting New product form, keeping six tutorials. Use its ordinary input/change action, shared draft, tab-memory save and discard. Example choices: selector `#new-product-files`, multiple selection replacing the draft list, at most three files, 25 MiB each. These limits and metadata fields are gallery choices, not human-mandated or WebMCP limits. Keep actual File objects private and out of JSON tools; expose summaries and state only. Do not create an uploader, base64 tool, alternate protocol, automatic shrinking/splitting, real persistence or a new dependency. Verify contracts and actual available browser behavior separately, then obtain independent review of the final commit and record CI/merge evidence on the PR.
