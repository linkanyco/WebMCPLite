/** Small adapter for the 2026-10-20 draft. App actions own validation and state. */
export function connectTools(tools, { modelContext = globalThis.document?.modelContext, signal } = {}) {
  const definitions = new Map();
  for (const tool of tools) {
    if (!/^[\w.-]{1,128}$/.test(tool.name) || !tool.description ||
        typeof tool.execute !== 'function' || definitions.has(tool.name)) {
      throw new TypeError('Tools need unique names, descriptions and execute functions.');
    }
    definitions.set(tool.name, { ...tool });
  }
  const scope = new AbortController();
  const stop = () => scope.abort();
  if (signal?.aborted) stop();
  else signal?.addEventListener('abort', stop, { once: true });
  const failure = (code, message) => ({ ok: false, error: { code, message } });
  const metadata = tool => {
    const { execute, ...info } = tool;
    return structuredClone(info);
  };
  async function call(name, input = {}, { signal: executionSignal } = {}) {
    if (scope.signal.aborted) return failure('inactive', 'This tool scope has ended.');
    if (executionSignal?.aborted) return failure('aborted', 'Execution cancelled.');
    const tool = definitions.get(name);
    if (!tool) return failure('not_found', 'Unknown tool.');
    const activeSignal = executionSignal ? AbortSignal.any([scope.signal, executionSignal]) : scope.signal;
    return tool.execute(input, { signal: activeSignal });
  }
  const ready = Promise.all([...definitions.values()].map(async tool => {
    if (scope.signal.aborted) return { name: tool.name, state: 'aborted' };
    if (typeof modelContext?.registerTool !== 'function') return { name: tool.name, state: 'unsupported' };
    try {
      await modelContext.registerTool({ ...metadata(tool), execute: (input, options) => call(tool.name, input, options) }, { signal: scope.signal });
      return { name: tool.name, state: scope.signal.aborted ? 'aborted' : 'registered' };
    } catch {
      return { name: tool.name, state: scope.signal.aborted ? 'aborted' : 'failed' };
    }
  }));
  return {
    ready,
    list: () => scope.signal.aborted ? [] : [...definitions.values()].map(metadata),
    call,
    dispose() {
      stop();
      signal?.removeEventListener('abort', stop);
    },
  };
}
