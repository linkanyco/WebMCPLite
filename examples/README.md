# Six runnable examples

The [public gallery](https://linkanyco.github.io/WebMCPLite/) opens without local setup. It shows the last successful deployment from `main`; the footer identifies the published commit.

For local development, use Node 22.22 or newer and run `npm install`, then `npm start` from the repository root. Open the printed local URL. Set `PORT=4187 npm start` to choose another port. `file://` execution is unsupported. `npm test` runs contracts and `npm run build:site` builds the static site.

The UI uses Ant Design with the LobeHub theme. All data is fictional. Save **updates a baseline in the current tab's memory**; reload resets it. Product and bulk editors share a catalog; the selection sheet reads that catalog. The asynchronous example has a separate fictional product.

| Page | Try this | Read / edit tools |
|---|---|---|
| `?page=product` | Run the AI demo → edit the name yourself → inspect the remaining AI marks → save/cancel | getProduct / setProduct (`p1`) |
| `?page=bulk` | Change two product prices → include one invalid row and verify the whole request is rejected | getProducts / setProducts |
| `?page=sheet` | Read product codes with getProduct → switch codeType to productCode and replace rows → reorder in the UI | getSheet / setSheet, getProduct |
| `?page=board` | Read and edit a title and note → continue typing yourself | getBoard / setBoard |
| `?page=guide` | Edit the second area → compare page-wide and single-area unsaved state → try navigation → cancel and move | getNotes / setNote, manuals and site map |
| `?page=async` | Run the AI demo → simulate save failure → inspect the retained draft → disable failure → retry | getProduct / setProduct, save/cancel |

The tool caller displays registered input contracts and examples when in-page `document.modelContext.getTools` and `executeTool` are available. Otherwise the AI demo and tool caller are disabled with a support message; ordinary UI edit/save/cancel still work. Registration and in-page invocation support are shown separately. Setters change drafts only. No call requires a revision counter.

## Use the registered tools

The runtime entry point is `document.modelContext`. Discover `site_map` to find pages, `site_manual` for shared behavior, and `page_manual` for the current page's contracts. These names are example conventions, not official required tool names. There is no HTML-marker or public JavaScript-global discovery step.

Browser agents discover registered tools and schemas through their browser. Rediscover after navigating; a browser may add a suffix to the displayed tool name. In-page JavaScript follows the separate path below, after registration has completed, in an environment implementing `getTools` and `executeTool`. Registration alone does not guarantee in-page invocation or support by every AI. See the [draft's distinction](https://webmachinelearning.github.io/webmcp/#modelcontext-interface).

```js
// On ?page=product, after the app has registered its tools.
const context = document.modelContext;
if (typeof context?.getTools !== 'function' || typeof context?.executeTool !== 'function') {
  throw new Error('This browser does not support in-page WebMCP discovery and invocation.');
}
async function invoke(name, input = {}) {
  const tools = await context.getTools();
  const tool = tools.find(t => t.name === name && t.window === window);
  if (!tool) throw new Error(`No tool is registered on this page: ${name}`);
  const result = JSON.parse(await context.executeTool(tool, input));
  if (result.ok === false) throw new Error(result.error.message);
  return result;
}
await invoke('page_manual');
await invoke('getProduct', { id: 'p1' });
await invoke('setProduct', {
  id: 'p1', patch: { name: 'Shared desk lamp', description: 'Updated together on this page.' }
});
// Review the draft, then explicitly save it.
await invoke('save', { form: 'catalog' });
```

Pass the discovered `RegisteredTool` directly to execution. It includes host objects such as `window`, so do not JSON-serialize the whole tool. For a displayed list, select `name`, `description`, and `inputSchema`. The page manual uses metadata from the registration definitions too. Read current state again after a call fails.

The reusable integration helper is [src/connect.js](../src/connect.js). [workspace.js](workspace.js) owns example state and validation; [tools.js](tools.js) defines tools, and [app.jsx](app.jsx) connects them to the UI. A consuming app connects its own state and server actions and need not adopt this example state model or UI stack.
