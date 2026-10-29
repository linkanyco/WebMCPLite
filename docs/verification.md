# Verification scope and reproduction record

Reference date: **2026-10-25 (America/Los_Angeles)**. GitHub records may show the next day in UTC.

The initial tables below are **historical observations before H32/H33**. Their public JS fallback, revision checks, domain terminology, setup, and artifact layout are not current recommendations. Subsequent corrections are described separately.

## Historical initial environments

| Environment | Observed | Limits |
|---|---|---|
| Node 26.0.0 / macOS | Built-in tests and local static server | Does not replace a consuming app's server checks |
| GitHub Actions / Node 22 | Contract-test CI | Not browser-engine coverage |
| Codex in-app browser (IAB) | document.modelContext registration → browser tool discovery → getter/setter/save/navigate → visible UI update | Browser/engine version was not exposed; native engine versus a provided layer was not independently determined |
| Historical direct JS fallback | Demo/tool caller used webmcpLite.call to update the same state/UI | Removed by H32; never established compatibility with AI that cannot execute JS |
| No-API case | Node test injected modelContext:null and checked unsupported status and the then-existing direct call | A separate unsupported ordinary browser was not actually run |

Chrome, Edge, Safari, mobile devices, external extensions/AI, iframe combinations, and permission-policy combinations were not verified. Successful registration does not prove every AI discovers tools. Real IAB calls are distinct from stubs and do not certify standard conformance.

## Historical initial automated checks

At initial gallery delivery, `npm test` passed 14 tests: registration unsupported/failure/disposal/cancellation, value serialization, manual/tool-list agreement, runtime validation, shared state and snapshots, bulk atomicity, related-product reads, whole-row-array replacement, two-area unsaved scope, busy-write guards, retained drafts after failed/aborted save, and successful retry.

Registration used a stub. An actual IAB getter returned a string that parsed once into an object, consistent with callbacks returning values rather than pre-serialized JSON.

Module syntax checks passed. Local smoke checks observed 200 responses for HTML/JS/JSON and 404 for `/.git/config`, `/.env`, and nonexistent paths. The historical server bound only to 127.0.0.1 and was not offered as a production server.

## Historical actual browser flows

The author and independent reviewer used separate tabs. The first full pass examined `28b6b43030e6b039f775875d97a72705b9e62764`; after fixes, a fresh-context review reproduced reload/history boundaries on `3947fa66e3311e9a05e019b46f93b4a63d023ead`. The sequence product → board → guide → reload → edit second area → blocked back → cancel → back to board passed. See [reviews](reviews/README.md) and linked PRs.

| Example | Observation at that time |
|---|---|
| Product | Browser getter/setter changed name/price in the same form with purple marks. A human edit cleared only that field's mark. The former stale-revision check rejected an outdated write. Display toggle preserved values/dirty; save cleared dirty/marks. |
| Bulk | One invalid price rejected the entire request. Two valid product edits appeared together. The UI demo used the historical JS fallback. |
| Historical domain-oriented sheet | Related product fields omitted from previews were readable. Switching the former numberType and replacing rows updated identifiers, quantities, and order. UI reorder used the same setter. H33 replaces this terminology with SKU/productCode/codeType. |
| Board | getBoard/setBoard edited title/note, human typing continued, and cancel restored the baseline. |
| Guide/navigation | site_manual loaded local JSON and page_manual exposed real contracts. Editing only the second form made page-wide dirty true while the first form stayed clean. Tool/link/browser-back navigation was guarded. |
| Async | Save locked fields/save/cancel. Failure retained draft, the then-existing counter, and AI marks. After disabling simulated failure, browser save returned saved:true and dirty:false. Reload restored fictional data. |

The UI was also used in the browser's narrow default panel. That is not separate desktop/mobile-device coverage. Browsers may suppress beforeunload depending on policy and prior user interaction.

## Save and authority limits

Saves update current-tab memory only. No real server persistence, authentication/authorization backend, audit integration, or cross-tab synchronization is provided. Inputs/results may be read by connected AI; consuming apps must preserve their existing authorization and data policies. Only fictional data is used. No npm package was published. Pages publishing was separately authorized by H31.

## Pages follow-up — H31

At that stage the suite had 15 tests, including artifact and repository-subpath checks. The historical build allowlisted eight runtime files and checked assets/modules/manuals under `/WebMCPLite/` and the published SHA. That file layout is superseded by the H33 bundled gallery. Actual first deployment and HTTPS observations are in [issue #16](https://github.com/linkanyco/WebMCPLite/issues/16) and PR #17; settings alone were not evidence of success.

## Standard entry point — H32

At this stage 16 tests passed. They checked ready/dispose-only helper behavior, no fallback discovery/call API, no historical marker/global in HTML/artifacts, registration abort not cancelling already running calls, and execution-signal forwarding. registerTool was still a stub in automated tests.

Local IAB in-page getTools/executeTool calls read related-product details, changed the sheet display, read site_manual, saved through ordinary UI, navigated through the standard tool, and discovered/edited the new board. This path was verified separately from browser-agent discovery/invocation. Exact final-commit review and public observations are in [issue #18](https://github.com/linkanyco/WebMCPLite/issues/18) and PR #19. These observations do not establish all-browser/AI support.

## English gallery — historical H33 delivery

The new English Ant Design/LobeHub gallery removes revision counters and uses neutral SKU/product-code examples. Run `npm install`, `npm test`, and `npm run build:site`; use `npm start` for local browser checks with Node 22.22 or newer.

Required checks cover simplified input/output contracts, absence of counters and parallel protocols, runtime validation, shared UI/AI state, atomic bulk edits, row replacement, AI marks, save/cancel, async busy/failure/abort recovery, page-wide unsaved scope, and bundled subpath-safe assets. Verify the rendered new UI and actual registered tools, not just the tests.

Observed results, environment details, test counts, final reviewed SHA, and public deployment checks for this follow-up are recorded on [issue #20](https://github.com/linkanyco/WebMCPLite/issues/20) and its linked PR as they occur. Historical passing counts above do not establish that this new final commit passed.

Before final review, a clean `npm ci`, 17 contract/artifact tests, and a production build passed on Node 26/macOS. The build contains bundled runtime assets and the English manual, with relative paths and commit identity; the bundler reports a large UI chunk. The application does not load the theme's optional remote fonts. The original H33 quotation intentionally retains two trailing spaces that a generic whitespace check flags; other changed files pass that check.

In a new IAB tab, the rendered Ant Design/LobeHub UI was observed at the browser's 1280×720 viewport. In-page standard calls changed a product without a counter, human edits cleared only their field's mark, unsaved navigation was blocked, and ordinary UI save returned saved:true/dirty:false. The searchable tool picker loaded the English site_manual. The product-list example retrieved related SKU/product-code data and changed the displayed identifier; UI row reordering was visible through a separately discovered browser-agent getSheet call. Discard restored the baseline. Standard tool navigation completed after registration scope disposal and registered the destination tools. Final-commit review and public deployment remain separate evidence recorded on the PR.

Independent review found a stale-alert case: after a UI save failure, a successful browser-agent save updated the draft badge but left the old active error alert visible. The common workspace change notification now clears stale UI feedback for both UI and tool actions. The exact fixed commit and actual regression observation are tracked on the PR, separately from the earlier review.

## Administrator tutorials — H34/H35 (2026-10-27)

Current scenario contracts are in [examples/README.md](../examples/README.md) and [contracts.md](contracts.md). H34 replaces the historical sheet, board-note, guide-note and async-recovery tutorial UI; H35 adds optional Korean UI with English default. Original verification above remains historical. Review and deployment outcomes are recorded in [issue #22](https://github.com/linkanyco/WebMCPLite/issues/22) and its PR rather than predicted here.

Before final-commit review, 19 automated contract/artifact tests passed. They cover partial translation patches and shared marks, atomic eight-product prefix pricing, search scoping with immutable stock, independent source/target workspaces, separate source/preview/save actions, abort/failure recovery and connector behavior. Tests use fake registration APIs where indicated; they are not browser-compatibility evidence. The Vite build still warns about the existing large UI chunk. The generated banner is locally bundled; storefront photos need external Unsplash access.

Actual IAB observations (engine/version not exposed): the English-default welcome page and cartoon banner rendered; the language button changed navigation, guidance, prompts, labels and document language to Korean without altering an edited product. Browser-discovered setProduct changed both descriptions visibly with default AI marks; a human edit cleared only its own mark, setHighlights hid marks without editing values, and unsaved navigation blocked until UI save. Twelve bulk rows rendered; an eight-product KEY-1 price update changed p1 from $89 to $80.10 while KEY-201 stayed $99; UI Discard restored the saved baseline.

Browser-discovered setSearch updated the visible KEY/≤$20 controls and six results. getProducts returned those same six and four low-stock entries (KEY-102:3, KEY-104:5, KEY-105:0, KEY-107:4); no stock column or product edit appeared. getStorefront → setStorefront → previewStorefront edited the actual source and rendered three photos with centered headings and white text shadows. UI save confirmed the storefront baseline. The site manual returned the lightweight project-information URL and GitHub link.

For multi-tab reuse, the source getter read the edited English and Korean descriptions; browser controls opened a separate New product tab. Its independently discovered setter populated the source values while retaining destination ID new-product, and save returned saved:true. The source tab retained its own catalog state. In-page invocation was separately observed through Developer tools → Execute tool, returning a parsed product object with stock. This is a tool caller, not a hosted AI model. Natural-language interpretation was performed by the testing agent, not by app code.

Desktop CSS viewport observed at 1135px wide. A requested 390×844 viewport override did not change the observed IAB viewport, so mobile rendering is **not verified in this pass**. The override was reset. No Chrome, Edge, Safari or general AI compatibility is claimed. Browser-agent tool handles were rediscovered when stale, including after iframe preview navigation. Source evidence intentionally retains one new trailing space in H34; no other new whitespace exceptions are intended.

## Developer guidelines — H36/H37 (2026-10-28)

This is a documentation-only follow-up. The standalone guide's three illustrative JavaScript blocks were extracted and exercised together with injected fake app functions and fake registration, inserting the collection definition before registration as instructed. Checks observed API-load wiring, shared UI/tool draft reads and edits, host input validation, no persistence from setters, shared save-button/tool persistence, current collection reads, copy isolation and registration-signal cleanup. These are snippet-wiring checks, not a production adapter, backend, prompt-behavior or browser-support test.

The existing `npm test` suite passed all 19 tests, including its bundled-artifact build. Relative file links in changed documentation resolved. No runtime source, dependency or downstream repository changed; no new rendered/browser verification was run for this documentation-only change. The existing large UI-chunk warning remains. H36/H37 preserve three trailing-whitespace lines inside verbatim human quotations; changed text outside that source file passes whitespace checks. The exact final reviewed commit, CI and merge outcome belong on the PR linked from [issue #24](https://github.com/linkanyco/WebMCPLite/issues/24).

## Ordinary file inputs — H40 (2026-10-28, America/Los_Angeles)

All 23 tests and `npm run build:site` passed on Node v26.0.0. Markdown targets, the guide's JSON example and H40 verbatim provenance were checked. The existing large UI-chunk advisory remains. Automated contracts use Node File objects and fake registration where applicable. They cover whole-list replacement, count/type/size validation with atomic retention, read-only JSON summaries, rejection of file payloads by setProduct, same-metadata/different-File dirty detection, saved-baseline restoration, failure retention and busy guards. These tests do not establish browser attachment or network upload support. The new form stores actual File references privately; no transfer endpoint was added.

Actual local IAB observations, without WebMCP stubs: browser-discovered page_manual returned the real `#new-product-files` guidance. Its input exposed the expected `multiple` and `accept` attributes. Browser-discovered setProduct populated SKU/code/name/price with visible AI marks. The documented filechooser flow reported multiple:true and accepted this public repository's fictional collaboration-banner.png (1,956,627 bytes). The visible list and getProduct.files reported its name, size and image/png MIME. This was one successful browser attachment to the ordinary input, not a WebMCP binary call, byte-integrity check or HTTP upload. It does not establish a maximum size or general agent compatibility.

A UI name edit continued the same draft. UI Create product saved fields and file selection in tab memory. Clearing files made isUnsavedContents report dirty and blocked tool navigation; UI Discard restored the saved filename and dirty:false. Switching to Korean translated the file guidance without changing the fields/list; switching back preserved them. Reload restored the blank draft and empty file list. A desktop screenshot was inspected. Engine/version was not exposed by the available DOM inspection; do not infer one from the API name.

Support discrepancy: official OpenAI [Browser documentation](https://learn.chatgpt.com/docs/browser), checked in this task, still says built-in-browser automatic uploads are unsupported. This task's chooser succeeded despite that documentation. Record the observation narrowly and retain the user-selection handoff. Other browsers, clients, PDF/JPEG attachment, multiple-file browser attachment, very large files and network persistence were not verified. General app behavior for these formats/counts is covered only by contract tests. Exact final-commit review, CI and merge evidence are recorded on the PR linked from [issue #28](https://github.com/linkanyco/WebMCPLite/issues/28).
