# Progress record

Reference date: 2026-10-25 (America/Los_Angeles). Use [issue index #1](https://github.com/linkanyco/WebMCPLite/issues/1) and the linked PRs for current status, dependencies, final reviewed SHAs, checks, and deployment results.

## Historical initial delivery — H01–H29

The original intent and research were preserved, including the supplemental H29. An independent review corrected the BrowserMCP factual error before publication. Contracts, helper, and six examples were then reviewed and merged through PRs.

| Issues | Deliverable at the time | PR |
|---|---|---|
| [#2](https://github.com/linkanyco/WebMCPLite/issues/2), [#3](https://github.com/linkanyco/WebMCPLite/issues/3) | Minimal contracts and consumer harness | [#12](https://github.com/linkanyco/WebMCPLite/pull/12), merged |
| [#4](https://github.com/linkanyco/WebMCPLite/issues/4) | Initial 47-line helper, registration/failure/disposal, historical JS fallback | [#13](https://github.com/linkanyco/WebMCPLite/pull/13), merged |
| [#5](https://github.com/linkanyco/WebMCPLite/issues/5)–[#10](https://github.com/linkanyco/WebMCPLite/issues/10) | Product, bulk, historical domain-oriented sheet, board, navigation, async recovery | [#14](https://github.com/linkanyco/WebMCPLite/pull/14), merged |
| [#11](https://github.com/linkanyco/WebMCPLite/issues/11) | Browser observations, limits, direction review, handoff | [#15](https://github.com/linkanyco/WebMCPLite/pull/15), merged |

The initial gallery used browser modules without installation/build and had 14 contract tests plus CI. Real IAB discovery, invocation, and shared editing were observed. Those setup and domain choices are historical, superseded by H33. Each issue preserved relevant human quotations separately from proposals and its posted body was checked.

[Reviews](reviews/README.md) record examined commits; [verification](verification.md) separates stubs from actual browser observations. Real persistence, a production authorization backend, general browser/AI compatibility, and a reuse license were not delivered. Advanced search, PDF processing, and hosted chat remained future/out-of-scope.

## GitHub Pages — H30/H31

[Issue #16](https://github.com/linkanyco/WebMCPLite/issues/16) and [PR #17](https://github.com/linkanyco/WebMCPLite/pull/17) added the fictional public gallery, repository-subpath-safe assets, runtime-only build artifacts, main-only deployment, and published commit identity. H31 specifically added this authority to the initial local/source scope. The test suite at that stage had 15 tests.

## One standard entry point — H32

[Issue #18](https://github.com/linkanyco/WebMCPLite/issues/18) and [PR #19](https://github.com/linkanyco/WebMCPLite/pull/19) replaced the historical metadata/global protocol with document.modelContext. Registered manual tools and ordinary UI shared actions remained. The old JS fallback in the table above is delivery history, not current guidance.

At this stage, 16 tests covered registration/execution lifetime separation and absence of parallel public entry points. Local IAB in-page getTools/executeTool was observed for manual reads, related-product display, navigation, and calls on the new page. Final-SHA review, CI, and public Pages evidence are recorded on the PR. Revision contracts were not changed during H32.

## English gallery redesign and simpler contracts — H33

[Issue #20](https://github.com/linkanyco/WebMCPLite/issues/20) tracked the delivered follow-up (merged PR #21): English site/docs, README motivation, no revision counters, neutral SKU/product-code data, and Ant Design with the LobeHub theme. The core remains framework independent; the gallery now requires dependency installation and a Vite build.

The original Korean human quotations and historical AP/verification remain preserved with English explanation. Current contracts and walkthroughs describe the simplified calls. Required checks, actual rendered/browser observations, fresh-context review of the exact final SHA, merge, and public deployment are recorded on the linked PR as each happens. This work-in-progress entry does not claim completion before that evidence exists.

## Administrator tutorials and bilingual UI — H34/H35

[Issue #22](https://github.com/linkanyco/WebMCPLite/issues/22) follows merged #21. Human requests are preserved separately from AP implementation choices in PLANS §15 and the source evidence. The implementation replaces the former generic examples with six administrator scenarios, a cartoon welcome page, a supporting New product form, English-default/Korean UI, tool-only highlight visibility control, and a developer tab.

Nineteen automated tests and real IAB edits/search/preview/multi-tab reuse were observed before review; see [verification](verification.md) for limits, including unverified mobile rendering. Final-SHA review, checks, merge and deployment must be recorded on the PR/issue when completed. No new runtime dependency or connector change was needed.
