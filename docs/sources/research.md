# WebMCPLite research handoff

Reference date: 2026-10-25. This document separates public-source observations from design proposals. Differences from existing products are hypotheses to test in examples, not claims of novelty, adoption, or performance superiority.

## 1. Official WebMCP: facts checked during planning

- The document checked was the **2026-10-20 Draft Community Group Report** from the Web Machine Learning Community Group. It was not a W3C Standard or a Standards Track document.
- The API entry point was `document.modelContext`. A site registers `name`, `description`, `execute`, and optional `title`, `inputSchema`, and `annotations` through `registerTool()`.
- `getTools()` lets in-page JavaScript agents discover accessible tools. **Browser agents discover tools through separate browser mechanisms.** It would be inaccurate to require every external AI to call getTools.
- Registration lifetime can use AbortSignal. An execute callback returns a JSON-serializable value; the platform's executeTool returns its result as a JSON string. Pre-stringifying an object can serialize it twice. Check input, result, and error behavior against the draft and actual supported browser.
- Registered tools and metadata provide the standard entry point. The draft does not require `#agentsmd`, `site_manual`, `page_manual`, or `site_map`. Manual/map tool names in this repository are example conventions; H32 removes the historical marker proposal.
- Human–AI collaboration on the same screen and reuse of existing app logic already appear in the official introduction. These goals are not inventions unique to WebMCPLite.
- Hints and descriptions do not replace authorization or user approval. Actual support requires browser/agent-specific verification.

Source: [WebMCP draft and API](https://webmachinelearning.github.io/webmcp/), especially §§1, 4.2, 4.2.1, 4.2.3, and 6.2.

## 2. nekuda WebMCP Kit: facts checked during planning

- A separate development toolkit/SDK using WebMCP, helping with site analysis, tool planning, code connection, and browser verification. No evidence established it as an official implementation from the specification team.
- `renameBoard` was a **shared action in a board example**, not an API style imposed by Kit. getBoard/setBoard is also possible; usability depends on clear contracts.
- UI and AI tools call shared app functions. Runtime validation, state changes, and server authorization remain in those functions and existing server boundaries.
- The SDK is optional; a few tools can register directly. It helps with route scopes and cleanup, not runtime input validation, browser polyfills, or an MCP-server transport. Registration reports unsupported when the browser API is unavailable.
- Documentation described limited telemetry enabled by default, excluding raw input/results and persistent visitor IDs. It described `telemetry: false` or pre-load global configuration to disable it, with input/result tracking as a separate opt-in.
- The SDK's dependency-free runtime claim was documentation evidence, not an independently measured bundle or audited runtime.

Sources: [Kit introduction](https://docs.nekuda.ai/), [SDK and telemetry](https://docs.nekuda.ai/sdk), [board verification example](https://docs.nekuda.ai/verification-example).

## 3. Adjacent projects and overlap — dated observations

### FrontMCP

**Official documentation checked during planning:** `@frontmcp/react` hosts a server within a React app and registers component-lifetime tools/resources, including state-store integration. Describing it as backend-only MCP would be wrong.

**Earlier source observations:** WebMCP plugin, state/action, and router integration existed. This did not establish that a custom hosted chatbot is mandatory. Shared drafts, attribution marks, review/save UX, current product-wide behavior, and bundle size require separate verification; absence in a limited source sample is not proof of absence across the product.

Sources: [React documentation](https://frontmcp.dev/reference/react), [observed React source](https://github.com/agentfront/frontmcp/tree/fcf760fec0dc293a599cb5499fe43db923342df6/libs/react), [WebMCP plugin source](https://github.com/agentfront/frontmcp/tree/fcf760fec0dc293a599cb5499fe43db923342df6/plugins/plugin-webmcp).

### SiteMCP

**Earlier source observation, not rechecked in the execution chat:** `ryoppippi/sitemcp` was a CLI crawling URLs into Markdown and providing MCP list/document-read tools. That purpose differs from editing shared drafts in a live app. Do not confuse similarly named services or infer project viability from commit counts or release age.

Sources: [SiteMCP](https://github.com/ryoppippi/sitemcp), [server](https://github.com/ryoppippi/sitemcp/blob/main/src/server.ts), [fetcher](https://github.com/ryoppippi/sitemcp/blob/main/src/fetch-site.ts).

### BrowserMCP

**Rechecked in the execution chat on 2026-10-25:** an MCP server and extension for browser navigation/form entry. The [official changelog](https://browsermcp.io/changelog/) listed v1.4.0 dated 2026-10-18, and [extension setup](https://browsermcp.io/docs/setup-extension/) described connecting the current tab with a Connect button. The handoff's earlier claims about version 2.0, popup permission, and AI-app tab groups were not supported and were corrected.

**Limits:** a past core-0.1.3 source observation and selected current docs do not establish the current complete tool list, arbitrary JS support, or architecture.

Sources: [BrowserMCP](https://browsermcp.io/), [documentation](https://browsermcp.io/docs/), changelog and setup above.

## 4. Proposals derived from the research — AP

Start with small integration conventions, a development harness, and runnable examples using WebMCP. Do not build a competing communication protocol or imply official affiliation.

The practical hypothesis is that examples make it easier to let AI edit the visible draft through shared functions while a person reviews and continues. Tool exposure and manuals themselves already overlap existing work. Keep developer and runtime manuals distinct and aligned with real contracts.

Prefer simple get/set with explicit patch/replacement/null/array/save meanings. Distinguish edit/save/submit/navigation outcomes using app-confirmed state, not HTTP success alone. Do not expand approval scope on behalf of the user.

**Historical AP, superseded:** initial verification ideas included stale-revision checks and an explicitly labeled direct-JS fallback in unsupported browsers. H32 removes the parallel fallback and H33 removes the example revision mechanism. Those ideas remain historical evidence, not current recommendations.

Fresh-context review should keep asking whether each abstraction is needed, whether direct registration or an existing SDK suffices, and whether manuals match behavior.

## 5. Source limits

Only the stated official-document scope was checked. GitHub links trace earlier source observations; this document does not claim that platform access was repeated. It does not warrant current competitor behavior, complete code coverage, browser support, benchmarks, license suitability, or package/trademark availability. Recheck the needed primary sources before making new current claims. No private code, customer data, or internal work links are included.

## 6. Execution-chat recheck — 2026-10-25

The [draft](https://webmachinelearning.github.io/webmcp/#modelcontext-interface) §§4.2/4.2.1 describes Promise-returning registerTool, Promise<any> callbacks, and a platform-serialized string result from executeTool. The helper returns values from callbacks and handles registration rejection and signal cleanup. It does not claim support for the older navigator interface.

The [Kit implementation guide](https://docs.nekuda.ai/skills/implement) also discusses visitor-oriented tools connected to existing actions. A prior ask_site observation was not reverified verbatim from that guide, so manuals are not described as a Lite-only invention.

## 7. Subsequent human corrections

[H32](human-intent.md) takes precedence over initial metadata/global-entry AP: use only document.modelContext, distinguish browser-agent discovery from in-page getTools/executeTool, and retain ordinary UI when unsupported.

[H33](human-intent.md) explicitly removes revision counters and fashion-specific samples, selects English current documentation/site copy, and requests Ant Design with the LobeHub theme. The UI stack is a human-requested gallery choice; it does not change the browser API or create a dependency for the framework independent connection helper. Earlier research and proposals are not deleted or retroactively presented as human decisions.

## 8. H33 implementation sources — 2026-10-25

Rechecked the [official WebMCP draft](https://webmachinelearning.github.io/webmcp/) dated 20 October 2026. The existing registration helper and in-page invocation path continue to use the draft interface; removing an application counter does not change that interface. This is implementation alignment with a Community Group draft, not certification as a W3C Standard.

The [Ant Design Vite guide](https://ant.design/docs/react/use-with-vite/) documents using its React components in a bundled app. The installed official npm package metadata for `@lobehub/ui@5.64.2` declares Ant Design `^6.1.1` and React `^19` peers, and its ThemeProvider implements LobeHub's Ant Design theme. This compatible release is pinned with Ant Design 6.6.8; the newer Lobe UI 6 line has a different theming architecture. The gallery uses the actual providers and disables their optional remote font loading. The connection helper remains dependency-free.
