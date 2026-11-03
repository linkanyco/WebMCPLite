# Open questions

These discussions remain open under [H45](docs/sources/human-intent.md). Current choices are adjustable project conventions, not WebMCP requirements.

## WMCL-01 — When should guidance be split?

**Status: open.** Ordinary work should start from discovered tool definitions. Prefer readable names, schemas, a small example and concise effect/scope boundaries over repeated prose. Do not require page_manual → another manual → action. A site map can be a separate registered tool. If specialized detail genuinely cannot fit usefully, aim for one optional read that returns the needed context. How should an app choose groups without hiding a necessary action or repeating common rules? Revisit with measured discovery time, tool-selection quality and actual task traces. The gallery currently needs no supplemental manual tool.

## WMCL-02 — Mobile AI browser support

**Status: open; mobile is not excluded.** The human considered dropping mobile, then explicitly chose to leave it as a question. Current OpenAI [Site tools documentation](https://learn.chatgpt.com/docs/webmcp) describes desktop built-in-browser support; this is not evidence that all mobile AI browsers are absent. Preserve responsive ordinary UI and capability detection. Collect actual client/device observations before deciding whether to alter support or presentation; do not infer support from screen width or user-agent strings.

## WMCL-03 — What is an appropriate metadata budget?

**Status: open.** The initial project default is **100 KB = 100,000 UTF-8 bytes** of JSON-serialized registered tool metadata, excluding executable functions and live tool results. This is not a token count, official maximum, proven safe payload or requirement to fill the budget. Titles/descriptions/schema/example size, tool count, browser loading, model selection and host-provided context all matter; byte size alone does not establish usability.

Run `npm run context:report`; site developers can override the advisory with `WEBMCP_CONTEXT_BUDGET_BYTES=50000 npm run context:report` or choose their own host configuration. Over-budget reports are signals to inspect, not registration failures. Preserve required authorization/effect information and working UI; never silently truncate or drop tools. Compare discovery latency, task accuracy, repeated reads and client rejection evidence before revising the default or splitting. The [WebMCP draft §6.4.2](https://webmachinelearning.github.io/webmcp/#restricting-maximum-input-lengths) discusses further limit research; it does not establish a 100 KB metadata guarantee.
