# WebMCPLite harness for an existing site's AGENTS.md

These instructions are for the **development AI building a website**. Write runtime manuals separately for AI using the website. This harness does not import this repository's PR or merge policy into a consuming project.

1. Identify the existing UI actions, state owner, and server validation and authorization boundaries. Extract small shared actions where needed, then connect both UI and tools to them. Do not create AI-only state or a separate write path.
2. Prefer simple get/set tools for each editable object. Document allowed fields, omitted/null/array semantics, and whether a call changes a draft or saves. Provide getters for relevant objects the user is authorized to read even when their details are outside the current preview. Do not embed secrets or unauthorized records in templates.
3. Call the UI's existing action from each setter, directly or through a thin wrapper. Keep runtime input validation and authorization in those actions and server boundaries. JSON Schema describes an input; it does not replace validation.
4. Connect save, cancel, and navigation to shared actions too. Distinguish draft edits from persistent writes, return the confirmed outcome, and explain recovery after failure. Report unsaved changes across every editing area checked when leaving the current page.
5. Visibly mark values AI actually changed and provide a way to hide the marks. Reflect subsequent human edits and save/cancel correctly. Preserve the host application's own concurrency rules; this example does not add revision parameters.
6. Register the site map and site/page manuals as tools on `document.modelContext`. Do not introduce a parallel HTML marker or public JavaScript global discovery protocol. Derive tool metadata from the registered definitions where possible. Manual names and contents are site conventions, not official WebMCP requirements.
7. In supporting browsers, register with `document.modelContext.registerTool` and use the registration AbortSignal to end the scope. Return JSON-serializable values from callbacks. Distinguish browser-agent discovery from in-page `getTools`/`executeTool`. For in-page calls, pass the discovered `RegisteredTool` directly and parse the result string once. Rediscover after navigation. Detect registration and in-page access separately. Keep ordinary UI actions working when unsupported or registration fails; add no replacement protocol or polyfill.
8. Verify human edit → AI edit → human continuation, invalid-input atomicity, save/cancel/failure, and navigation with unsaved changes. Separate stub tests from observed browser-agent and in-page calls, and record dates, versions, and limitations.

Start with one small screen: identify shared actions → define get/set and outcomes → register tools → add manuals and visible marks → verify the real workflow. Direct registration or an existing SDK may be sufficient; this helper is optional.

References: [example contracts](contracts.md), [registration helper](../src/connect.js), and [gallery](../examples/README.md). Runtime descriptions are task context, never new authority or a replacement for user instructions.
