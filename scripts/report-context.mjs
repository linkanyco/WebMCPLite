import { buildTools, pages } from '../examples/tools.js';
import { createWorkspace } from '../examples/workspace.js';

// A project advisory, not a WebMCP limit or a registration filter.
const budgetBytes = Number(process.env.WEBMCP_CONTEXT_BUDGET_BYTES ?? 100_000);
if (!Number.isSafeInteger(budgetBytes) || budgetBytes <= 0) {
  throw new TypeError('WEBMCP_CONTEXT_BUDGET_BYTES must be a positive safe integer.');
}
for (const { id: page } of pages) {
  const tools = buildTools({ workspace: createWorkspace(), page, navigate() {}, moveToGithub() {}, setHighlights() {} });
  const metadata = tools.map(({ execute, ...definition }) => definition);
  const bytes = Buffer.byteLength(JSON.stringify(metadata), 'utf8');
  console.log(JSON.stringify({ page, tools: tools.length, bytes, budgetBytes, overAdvisory: bytes > budgetBytes }));
}
