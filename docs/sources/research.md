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

## 9. File selection and transport — checked 2026-10-28

- The [27 October 2026 WebMCP draft](https://webmachinelearning.github.io/webmcp/), §§3.1 and 4.2, serializes tool arguments as JSON and parses them for callbacks. It defines no File/Blob transport, file-reference format or `setFile` method. §6.4.2 discusses further input-length research; it specifies no fixed 2 MB file limit. This describes the current draft, not all possible browser features.
- [Chrome's declarative guide](https://developer.chrome.com/docs/ai/webmcp/declarative-api) describes annotated forms and schema-driven prefill, without defining a file-payload contract. [Secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools) recommends compact tool content and describes agent-dependent limits. Adding form annotations does not establish binary transfer. The security page mentions `requestUserInteraction`, absent from the newer draft; this project does not depend on it.
- The [HTML file-input standard](https://html.spec.whatwg.org/multipage/input.html#file-upload-state-(type=file)) defines selected files, `multiple`, picker hints in `accept`, and input/change events. `accept` is not validation. [Input APIs](https://html.spec.whatwg.org/multipage/input.html#common-input-element-apis) prohibit setting a nonempty file-input `value`; an agent needs a supported attachment mechanism and authorized files, not a typed local path.
- [WebDriver Element Send Keys](https://www.w3.org/TR/webdriver2/#element-send-keys) defines a separate automation path for file selection. It is not a WebMCP tool API. Whether a particular AI exposes an equivalent capability must be checked independently.
- Official OpenAI [Browser documentation](https://learn.chatgpt.com/docs/browser) says automatic file upload in the built-in browser is unsupported. [Site tools documentation](https://learn.chatgpt.com/docs/webmcp) says it supports a subset of WebMCP, excluding declarative forms and iframe tools. Top-level imperative tools can still read draft summaries; their availability does not prove automatic attachment support. Documentation checks are not a new upload success observation.

AP response under H40: keep ordinary inputs and app validation; describe them in registered manuals and a short initial instruction. Keep file bytes out of JSON tool inputs/results. Distinguish selection, draft preparation, upload and save, and provide a user-selection handoff when automation is unsupported. Selector/contract fields and gallery limits are example choices. Large-file transport remains the host app/browser client's responsibility; WebMCPLite adds no transfer service, client-limit bypass or automatic file resizing/splitting. No private experiment artifacts are included as public evidence.

## 10. WebMCP report licensing — checked 2026-11-02

The official [WebMCP repository license at checked main 6cd745a](https://github.com/webmachinelearning/webmcp/blob/6cd745ac8a186122bd3f4aeaeb1d6cfa820251d2/LICENSE.md) licenses its reports under the [W3C Software and Document License, 2023 version](https://www.w3.org/copyright/software-license-2023/). The specification is not unlicensed simply because it defines a browser interface. Its contribution/Community Group patent commitments are separate from the work's reuse license; no W3C CLA is added to WebMCPLite.

The W3C text permits copying, modification and distribution for any purpose, subject to its full notice, existing notices, change notices and other terms; it includes warranty/liability and name/trademark provisions. [SPDX's official entry](https://spdx.org/licenses/W3C-20150513.html) explicitly says the 2023 changes retain identifier `W3C-20150513`. This does not describe the licenses of browser implementations, third-party dependencies or assets.

AP under H41: use that same license for original WebMCPLite code and documentation, with WebMCPLite's own copyright notice. Include the full license in the repository and linked gallery asset. This is the project's choice under the human's “비슷하게 가자” request, not a requirement imposed by WebMCP or a claim of W3C approval.

Bundled dependency notices are taken from the installed packages' license/notice files, not relicensed as W3C work. Two pinned distributions need explicit handling: `@ant-design/icons-svg@4.6.0` omits its license file, so it uses the same upstream [Ant Design icons license](https://github.com/ant-design/ant-design-icons/blob/master/LICENSE) retained by `@ant-design/icons`; that text was checked through host gh. `is-mobile@5.0.0` carries its complete MIT notice in its distributed README's License section. Other missing notices fail the build instead of silently guessing terms. This is a small gallery build step, not a reusable licensing service or a change to the WebMCP helper.

## 11. About-page definition — checked 2026-11-02

The [current WebMCP draft](https://webmachinelearning.github.io/webmcp/) identifies itself as a 2 November 2026 Draft Community Group Report. Its Abstract defines JavaScript-based tools supplied by web applications to AI agents; §1 describes natural-language tool descriptions, structured schemas and collaborative work within the same web interface using existing app logic. It is not a W3C Standard or Standards Track specification. These support the About definition and shared-workflow explanation. This check is not a benchmark, new cross-client support test or a repository-wide API migration. Responsiveness/less repeated screen interpretation are the proposed design aims; no quantified speed, latency minimum or 100% feature-coverage result was established.

## 12. Discovery context and size — checked 2026-11-02

The [2 November WebMCP draft](https://webmachinelearning.github.io/webmcp/#modelcontexttool-dictionary) provides registered tool descriptions and structured schemas. It does not require page_manual/site_manual tools or define a general free-text model-context injection channel. In [§6.4.2](https://webmachinelearning.github.io/webmcp/#restricting-maximum-input-lengths), further size-limit research is still needed; no 100 KB total metadata guarantee is established. Current [OpenAI Site tools documentation](https://learn.chatgpt.com/docs/webmcp) describes agent discovery/invocation through its desktop built-in browser, including declarative forms and iframe tools. This supersedes older client-document exclusions as current advice, while dated historical observations remain preserved.

AP under H45 uses standard per-action metadata, a developer-adjustable 100,000-byte initial advisory and one optional specialized guidance read by design. UTF-8 bytes are not LLM tokens, and host policies/context budgets may differ. Neither these documents nor this task demonstrate universal 100 KB acceptance, latency or tool-selection quality. The desktop support statement is about one implementation, not evidence that all mobile AI browsers are absent. Open questions live in [ISSUES.md](../../ISSUES.md).
