# WebMCPLite

I started this project because I wanted an easier way for people and AI to work together on the same website. During that exploration, I found that **WebMCP already defines the browser interface**. WebMCPLite follows that existing specification and offers practical examples for people who want to use it as easily as I do.

**[Open the examples](https://linkanyco.github.io/WebMCPLite/)** · [Example walkthroughs](examples/README.md) · [Integration guide](docs/consumer-AGENTS.md)

This is an independent companion to the [WebMCP draft](https://webmachinelearning.github.io/webmcp/): small development conventions, a framework independent registration helper, and six ecommerce administrator tutorials. It does not define another discovery protocol, require a hosted chatbot, or claim official affiliation or universal browser support.

## Try it locally

Use Node 22.22 or newer, then run:

```sh
npm install
npm start
```

Open the local URL printed by the server. Use `PORT=4187 npm start` if the default port is occupied. `npm test` runs contract tests; `npm run build:site` produces the static site in `dist/`.

The gallery uses **Ant Design with the LobeHub theme**. The reusable [registration helper](src/connect.js) has no dependency on that UI stack. All example data is fictional. Save updates a baseline in the current tab's memory; reloading restores the initial data.

## What the examples show

- Polish English product copy and fill a separate Korean description in the same form.
- Reduce prices across a SKU prefix with an atomic bulk update.
- Search by SKU and price, then ask about authorized stock data omitted from the table, scoped to the current results.
- Edit category-banner HTML/CSS and inspect it in a sandboxed Preview.
- Find the project information page through registered manuals and navigation.
- Remember product details and create the same product in another tab through its ordinary New product form.

The welcome page introduces WebMCP discovery with a cartoon banner. Tutorial prompts sit above ordinary admin screens; the tool playground is in a separate Developer tools tab. The EN / 한국어 buttons switch interface copy without changing drafts; English is the default. AI highlights start on and `setHighlights` can hide them.

Setters update drafts; saving is a separate action. Calls do not require revision counters. These are example app contracts, not additional requirements imposed by WebMCP.

## One WebMCP entry point

Runtime tools register through **`document.modelContext`**. Browser agents discover and invoke registered tools through the browser's capabilities. In-page JavaScript requires the draft's `getTools()` and `executeTool()` APIs; the [walkthrough](examples/README.md) shows that path separately.

Registration support and in-page invocation support are reported independently. Ordinary UI editing, save, and cancel remain available when WebMCP is unavailable. There is no extra public global API, HTML discovery marker, transport, or polyfill.

The project follows the linked draft API; it is not a standards certification. [Verification notes](docs/verification.md) distinguish automated stubs from observed browser calls and list untested environments.

## Project notes

- [Contracts](docs/contracts.md) and [consumer AGENTS.md harness](docs/consumer-AGENTS.md): adapting an existing website.
- [PLANS.md](PLANS.md) and [source evidence](docs/sources/human-intent.md): human requests, research, and implementation choices kept separate.
- [Progress](docs/progress.md), [independent reviews](docs/reviews/README.md), and [issue index](https://github.com/linkanyco/WebMCPLite/issues/1): delivery records.
- [AGENTS.md](AGENTS.md): rules for development agents working in this repository, distinct from runtime manuals.

GitHub Actions tests and builds pull requests. Changes merged to `main` are published to GitHub Pages; the public site shows the last successful deployment. The footer's **Build** link and [version.json](https://linkanyco.github.io/WebMCPLite/version.json) identify that commit.

The repository is public, but a reuse license has not yet been selected. Publication does not grant a redistribution or package publishing license. No private customer code or data is included.
