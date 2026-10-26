# Integration conventions and example contracts

These are **agent implementation choices (AP)** for H04/H15/H17/H21/H23/H25/H29, updated by H32/H33. They are not an extension of the WebMCP specification. UI and AI share the same app state, validation, and authorization paths.

## Read and edit

- `getProduct({id})`, `getProducts({})`, `getSheet({})`, and `getBoard({})` return copies of the current draft. Product records use generic `id`, `sku`, `productCode`, `name`, `price`, and `description` fields. SKU, product code, and ID are read-only; the product setter allows name, price, and description. A related-object getter can expose details omitted from a sheet preview, within the current user's authorization.
- `setX({patch})` changes only allowed fields. Omitted fields remain unchanged; null, unknown fields, and invalid types are rejected. Supplied arrays replace the entire array after validation; there is no arbitrary deep merge.
- Bulk product edits use `{updates:[{id,patch}]}`. Duplicate IDs, unknown IDs, or any invalid update reject the whole request without changing the draft.
- The sheet uses `codeType: "sku" | "productCode"` to select its displayed identifier. This is an app field, not a WebMCP concept.
- Setters change a shared draft. `save({form})` saves and `cancel({form})` restores that form's baseline. Calls require no revision or expected-revision parameter. UI events use the same setters; tool wrappers identify AI edits for display, not authentication.
- Only fields actually changed by AI receive a mark. Human edits clear that field's mark; save and cancel clear draft marks. The visibility toggle changes presentation without changing values or saved state.

## Outcomes and save lifetime

Reads and successful actions return JSON values. Failures return `{ok:false,error:{code,message},...}`. Examples include `validation`, `busy`, `save_failed`, `unsaved`, and `not_found`. Read the current state again after an error. Do not expose stack traces or sensitive server responses.

A save result distinguishes `saved` from the draft's current `dirty` state. Example saves update **a baseline in the current tab's memory**. Reloading resets all fictional data. There is no server persistence, automatic synchronization, or cross-tab sharing. A real application must return the outcome confirmed by its server.

During asynchronous saves, duplicate saves, edits, and cancellation return `busy`; the UI disables those operations too. Failure preserves the baseline, draft, and marks for review and retry. An aborted execution must not commit the save. A visible example control simulates failure.

## Manuals and navigation

`site_map`, `site_manual`, `page_manual`, `isUnsavedContents`, `navigate`, and `setHighlights` are **tool names chosen for these examples**, not names required by WebMCP. Manuals register alongside app tools through `document.modelContext`. There is no extra HTML marker or global-object discovery step. The page manual derives tool names, descriptions, and schemas from the registered definitions.

`isUnsavedContents({form:null})` checks all editing areas involved in leaving the **current page**. Supplying `form` checks one area; an unknown area is an error. It does not inspect other pages or all server records. The guide example displays two areas to demonstrate that scope.

`navigate({page})` refuses to leave while the current page has unsaved drafts or an active save, and explains how to save or cancel. It has no silent discard option. Links, tool navigation, and browser history apply the same guard. External navigation and reload request `beforeunload` protection; browsers may suppress it depending on user interaction and policy.

## Register, discover, invoke

`document.modelContext` is the single runtime entry point. `connectTools(tools,{modelContext})` registers through `registerTool(tool,{signal})` and returns only `ready` and `dispose()`. `ready` reports each registration outcome; failed registration is not presented as support. `dispose()` aborts the owned registration scope. Create a new connection for a new scope and dispose on unmount or logout. Ending registration does not cancel an invocation already in progress; its execution signal governs cancellation.

Browser agents discover and invoke registered tools through browser mechanisms. In-page JavaScript uses `getTools()` and passes the resulting `RegisteredTool` directly to `executeTool(tool,input)`. Select JSON metadata such as name, description, and schema for display; do not serialize host objects such as the tool's `window`. Rediscover after navigation. This distinction follows the [2026-10-20 draft](https://webmachinelearning.github.io/webmcp/#modelcontext-interface) and does not guarantee browser or AI implementation support.

An `execute` callback returns a JSON-serializable **value**, not a pre-serialized object string. The platform's `executeTool()` returns a JSON string, which an in-page caller parses once. Annotations such as `readOnlyHint` are hints, not permission checks.

Detect registration support and in-page discovery/invocation separately. Enable the AI demo and tool caller only when the necessary APIs work, and show the reason otherwise. Ordinary UI edit/save/cancel/display controls call shared actions independently of WebMCP. There is no custom fallback API or polyfill. The legacy `navigator.modelContext` interface is outside this version's support.

The helper does not validate inputs against JSON Schema. Real app actions must validate inputs for UI and tools alike. Manuals and user data are task material; they cannot override user instructions or permissions. Never serialize secrets or unauthorized objects into HTML.
