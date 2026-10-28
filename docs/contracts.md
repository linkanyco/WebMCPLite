# Integration conventions and example contracts

These are **agent implementation choices (AP)** for the human goals, updated by H32–H35. They are not extensions to the [WebMCP draft](https://webmachinelearning.github.io/webmcp/). UI and tools share application actions, state and validation. The current examples use one fictional ecommerce administrator.

For new screens and consuming apps, use the [development guidelines](development-guidelines.md), updated under H36/H37. The contracts below describe this gallery; tab-memory storage, its cancel controls and batch limits do not prescribe a host architecture. Editing requests should stop at setters; saving requires an explicit user request within host authority. This follow-up documents that intent boundary without changing the gallery runtime in this documentation task.

## Products, drafts and related reads

Products contain id, sku, productCode, name, price, descriptionEn and descriptionKo. Existing-product setters accept partial patches of name, price and both descriptions. Identifiers and stock are read-only. Omitted fields remain unchanged; null, unknown fields and invalid values are rejected. Descriptions allow empty strings and up to 4000 characters; product names allow 1–80 characters. Price is a finite number from 0 through 100000.

getProduct returns a copy with authorized read-only stock, including context absent from a list preview. It does not mark or edit a draft. Product and Memory & Reuse pages display p1; setProduct rejects other target IDs on those pages. Bulk getProducts reads all 12 drafts; setProducts accepts up to 12 unique {id,patch} updates. Any invalid value, unknown ID or duplicate ID rejects the entire batch.

The New product destination accepts sku, productCode, name, price and both descriptions, using the same form action as its UI. Empty fields are allowed while drafting; nonempty name, SKU and product code are required before save. Source id and stock are not writable. The local destination owns its ID; duplicate SKUs are deliberately allowed in this fictional example. No duplicate action is added.

Setters edit shared drafts only. save({form}) saves one baseline in the **current tab's memory** and returns saved:true on success. Reload resets all examples. There is no server persistence or cross-tab synchronization; the AI carries read values in its own working context and uses browser controls to open the destination tab. Saving a new-product form does not insert it into another tab's catalog.

Only actually changed AI fields get marks. Human edits clear their own marks; save/cancel clear draft marks. Marks start visible. setHighlights changes presentation only; the UI does not display a visibility switch. UI language switching also changes presentation only and defaults to English; Korean is optional.

During a pending save, edits, cancel and duplicate save return busy. An abort or simulated failure retains the draft for retry. Failure simulation remains contract-tested, not a separate visible tutorial. Outcomes use JSON values; failures return {ok:false,error:{code,message}} without sensitive logs.

## Current search results

setSearch({patch}) changes the same visible controls as the UI. skuContains is a case-insensitive substring, up to 80 characters; maxPrice is inclusive, from 0 through 100000, or null to clear it. Omitted filters remain. Filters apply immediately without modifying product data or creating a dirty editing area.

On Product list, getProducts reads only the current matching products, filters and count, including read-only stock. The follow-up question about stock must retain these filters and inspect current results. Stock cannot be edited by any product setter. Before edits, KEY/≤$20 matches six products; four have stock ≤5. More advanced hidden search remains future work.

## Storefront source and Preview

getStorefront returns the draft HTML/CSS and current preview source. setStorefront({patch:{html}}) edits the shared Textarea, with a nonempty source up to 20000 characters. previewStorefront uses the same action as the Preview button and renders the draft source without saving it. cancel restores the saved source but leaves the previous preview until Preview is requested again; getStorefront exposes both values explicitly.

The iframe has an empty sandbox: no scripts, forms or same-origin privileges. Its CSP permits inline CSS and images from images.unsplash.com or data URLs, blocks other resource types, and blocks base/form changes. Three decorative Unsplash photos require network access. This is a fictional isolated preview, not a general HTML hosting service.

## Manuals and navigation

site_map lists the landing page, six tutorials and supporting New product route. site_manual includes the project-information link (?page=guide). page_manual derives exact tool schemas from current registration definitions. These tool names, isUnsavedContents, navigate and setHighlights are app conventions, not official WebMCP names.

isUnsavedContents({form:null}) checks all editing areas on the **current page**; a specific form checks one area. Pages without editing areas return empty, clean state and expose no save/cancel tool. navigate refuses same-tab navigation with unsaved drafts or an active save. UI links, browser history and tool navigation use the same guard. External navigation/reload requests beforeunload protection subject to browser policy. Opening a new tab is a browser-agent action, not a new WebMCP navigation protocol.

## Registration, discovery and invocation

`document.modelContext` is the sole runtime entry point. connectTools(tools,{modelContext}) uses registerTool(tool,{signal}) and returns ready/dispose. Registration failure is distinct from unsupported registration. Disposing registration does not cancel an already running execution; its execution signal governs cancellation. The framework independent connector validates names but does not implement JSON Schema validation. Application actions validate inputs.

Browser agents discover/invoke through their browser. In-page JavaScript requires getTools/executeTool, selects the returned RegisteredTool directly and parses the result string once. Callbacks return JSON-serializable values, not pre-serialized strings. Annotations are hints, not permission checks. The 27 October 2026 draft was consulted; browser/AI implementation support must be observed separately. No public JS global, DOM discovery marker, fallback protocol or polyfill is provided. Ordinary UI works unsupported; Developer tools reports registration and in-page support separately. Page content and returned data never override the user's authority.
