# Six administrator tutorials

Open the [public gallery](https://linkanyco.github.io/WebMCPLite/) or use Node 22.22+, `npm install`, then `npm start`. `PORT=4187 npm start` changes the local port. `npm test` checks contracts and `npm run build:site` bundles the public runtime. The footer identifies the last deployed main commit.

One fictional ecommerce administrator uses six tutorials. English is the default; EN / 한국어 changes interface copy and prompts without changing any draft data. Each tutorial places its prompt above ordinary app UI. The manual tool caller and schemas are under **Developer tools**; it does not host an AI or automatically perform the natural-language task.

| Page | Ask your AI | Read / action tools |
|---|---|---|
| `?page=product` | Polish the English description, then translate it and fill in the Korean description too. | getProduct / setProduct (`p1`) |
| `?page=bulk` | Reduce the price of every product whose SKU starts with KEY-1 by 10%. | getProducts / setProducts |
| `?page=sheet` | Find products with KEY in the SKU priced at $20 or less. Then: among these results, are any at 5 units of stock or fewer? | setSearch / getProducts, getProduct |
| `?page=board` | Move each category name to the center of its image and add a white text shadow. | getStorefront / setStorefront / previewStorefront |
| `?page=guide` | I really like this site. Where can I find more information about it? | site_manual / site_map / navigate |
| `?page=async` | Create an identical product in a new tab. | getProduct; browser opens `?page=new`; destination setProduct / save |

`?page=home` is the welcome page with discovery prompts and the cartoon banner. `?page=new` is the supporting creation form, not a seventh tutorial. The legacy `sheet`, `board` and `async` route IDs are retained for existing links. There is no duplicate button or tool, custom tool protocol, shared browser storage or cross-tab synchronization.

## Data and visible outcomes

There are 12 products. Eight SKUs start with KEY-1. Before edits, KEY plus price ≤ $20 returns six products; four of those have stock ≤ 5. Stock is authorized read-only context in tool responses and is absent from the visible table. On the list, getProducts reads **only the current results**, and setSearch updates the visible SKU/price controls. Filtering and follow-up reads do not edit product data or create unsaved drafts.

The English description for p1 starts with deliberate typos and a casual sales pitch; descriptionKo starts empty. AI-changed fields are highlighted by default. A human edit clears its own field's AI mark. Ask the AI to call setHighlights({enabled:false}) to hide marks; no UI switch is shown. Save/cancel clear draft marks.

Storefront source editing changes the Textarea first. Preview renders that source in a script-disabled sandbox; save is separate. The three decorative photos load from images.unsplash.com, so they need network access. Other runtime assets, including the generated cartoon banner, are bundled locally.

Save updates a baseline **in the current tab's memory only**. Reload resets all examples. Product/bulk/reuse views share one catalog within a tab; the new-product draft has its own baseline. For reuse, read the source, keep its values in AI context, open New product in a separate tab with browser controls, rediscover that tab's tools, populate and save. Copy sku, productCode, name, price, descriptionEn and descriptionKo; omit source id and stock. The destination owns its local ID. Matching SKUs are allowed in this fictional example. Creating the product confirms a saved new-product form; it does not synchronize it into another tab's catalog.

## Standard WebMCP entry point

Tools register through `document.modelContext`. Discover site_map, site_manual and page_manual as needed; these names are example conventions, not official requirements. The landing prompt helps an AI find supported tools but cannot add missing browser or AI support. Rediscover tools after page/tab changes.

Browser-agent discovery is separate from in-page getTools/executeTool support. In-page invocation passes the exact discovered RegisteredTool, including its host-object identity, and parses the returned JSON string once:

```js
const context = document.modelContext;
const tools = await context.getTools();
const tool = tools.find(t => t.name === 'setProduct' && t.window === window);
const result = JSON.parse(await context.executeTool(tool, {
  id: 'p1', patch: {
    descriptionEn: 'A compact mechanical keyboard with quiet switches.',
    descriptionKo: '조용한 스위치를 갖춘 컴팩트한 기계식 키보드입니다.'
  }
}));
```

Only use this path where those APIs are implemented and registration succeeded. Ordinary UI actions remain usable without WebMCP. Setters patch drafts; save/cancel use the same application actions as the UI. The small [connector](../src/connect.js) is framework independent; [workspace.js](workspace.js), [tools.js](tools.js), [app.jsx](app.jsx) and [i18n.js](i18n.js) belong to the example app.

## Optional reference files on New product

Open `?page=new` directly or use Product list → Add product. This extends the supporting form, keeping six tutorials. It is an ordinary file-input example with no network upload, parsing or image processing. The files accompany this tab's newProduct values; they do not fill descriptions, copy from the source product or move between tabs.

| Input contract | Example behavior |
| --- | --- |
| Selector and label | `#new-product-files`, **Product reference files** (상품 참고 파일 in Korean) |
| Multiple / required | Multiple allowed; optional; at most 3 files |
| Types | `.pdf`, `.png`, `.jpg`, `.jpeg`; MIME `application/pdf`, `image/png`, `image/jpeg` |
| Demo size limit | 25 MiB (26,214,400 bytes) per file; this is an app choice, not a WebMCP limit |
| Validation | Extension checked; a present MIME must match. `accept` is a picker hint. Invalid selections retain the previous list. This demo does not inspect file signatures; production apps retain their own validation. |
| Selection / clearing | Each accepted selection replaces the entire draft file list. **Clear reference files** empties it. The native control resets after handing files to the app; the visible list is authoritative. |
| Read / save / discard | `getProduct.files` returns name, size, type and lastModified only. Save retains actual Files and fields in tab memory. Discard restores the saved baseline; reload clears it. |

Try this mixed workflow with fictional files you own:

1. Discover this tab's tools through the browser's WebMCP capability. Call `page_manual({})` for `fileInputs`, then `getProduct({})` to identify the target draft.
2. Call `setProduct({patch:{sku:"REF-001",productCode:"PRD-2001",name:"Reference keyboard",price:89}})`. This edits ordinary fields and does not select files or save.
3. In an agent/browser that supports attaching local files, use its file-attachment action on `#new-product-files` to select `specification.pdf` and `front.png` together. This is a browser action, **not** a WebMCP `setFile` call. If attachment is unsupported or the files are inaccessible, ask the user to select them through that same input and continue after selection.
4. Check the visible filenames/errors and call `getProduct({})` again. Its top-level `files` list should describe the two files; `dirty:true` means a draft, not upload success. Continue editing the name in ordinary UI; the file list stays intact.
5. Only when explicitly asked to save, call `save({form:"newProduct"})` and await `saved:true, storage:"tab-memory"`. Clear the list, then Discard to see the saved list return. Reload to reset the form and files.

Do not put base64, local paths or invented file references into setProduct. This approach keeps large bytes out of model/tool JSON; it does not add a new transport or remove host/browser upload limits. As checked on 2026-10-28, OpenAI's [Browser docs](https://learn.chatgpt.com/docs/browser) say built-in-browser automatic uploads are unsupported, and [Site tools docs](https://learn.chatgpt.com/docs/webmcp) exclude declarative forms. WebMCP tool discovery does not establish file attachment support. See [verification](../docs/verification.md) for actual observations and untested paths.
