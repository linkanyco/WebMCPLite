/** Registration for the WebMCP draft. App actions own validation and state. */
export function connectTools(tools, { modelContext = globalThis.document?.modelContext, signal } = {}) {
  const definitions = tools.map(tool => ({ ...tool }));
  const names = new Set();
  for (const tool of definitions) {
    if (!/^[\w.-]{1,128}$/.test(tool.name) || !tool.description ||
        typeof tool.execute !== 'function' || names.has(tool.name)) {
      throw new TypeError('Tools need unique names, descriptions and execute functions.');
    }
    names.add(tool.name);
  }
  const scope = new AbortController();
  const stop = () => scope.abort();
  if (signal?.aborted) stop();
  else signal?.addEventListener('abort', stop, { once: true });
  const ready = Promise.all(definitions.map(async tool => {
    if (scope.signal.aborted) return { name: tool.name, state: 'aborted' };
    if (typeof modelContext?.registerTool !== 'function') return { name: tool.name, state: 'unsupported' };
    try {
      await modelContext.registerTool({ ...tool, execute: async (input = {}, options = {}) => {
        if (scope.signal.aborted) return { ok: false, error: { code: 'inactive', message: 'This tool scope has ended.' } };
        if (options.signal?.aborted) return { ok: false, error: { code: 'aborted', message: 'Execution cancelled.' } };
        // Registration lifetime must not cancel an invocation already in progress.
        return tool.execute(input, options);
      } }, { signal: scope.signal });
      return { name: tool.name, state: scope.signal.aborted ? 'aborted' : 'registered' };
    } catch {
      return { name: tool.name, state: scope.signal.aborted ? 'aborted' : 'failed' };
    }
  }));
  return {
    ready,
    dispose() {
      stop();
      signal?.removeEventListener('abort', stop);
    },
  };
}
