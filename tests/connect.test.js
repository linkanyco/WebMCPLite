import test from 'node:test';
import assert from 'node:assert/strict';
import { connectTools } from '../src/connect.js';
const tool = { name: 'getBoard', description: 'Read draft', inputSchema: { type: 'object' }, execute: async () => ({ title: 'Shared' }) };
function registry() {
  const entries = new Map();
  return { entries, async registerTool(def, { signal }) {
    entries.set(def.name, def);
    signal.addEventListener('abort', () => entries.delete(def.name));
  } };
}
test('unsupported registration exposes no alternative discovery or invocation API', async () => {
  const bridge = connectTools([tool], { modelContext: null });
  assert.deepEqual(await bridge.ready, [{ name: tool.name, state: 'unsupported' }]);
  assert.deepEqual(Object.keys(bridge).sort(), ['dispose', 'ready']);
  // The app action itself remains available to its ordinary UI.
  assert.deepEqual(await tool.execute({}), { title: 'Shared' });
});
test('registered callback returns an object and scope disposal unregisters it', async () => {
  const modelContext = registry();
  const bridge = connectTools([tool], { modelContext });
  assert.equal((await bridge.ready)[0].state, 'registered');
  const callback = modelContext.entries.get(tool.name).execute;
  const result = await callback({});
  assert.equal(typeof result, 'object');
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { title: 'Shared' });
  bridge.dispose(); bridge.dispose();
  assert.equal(modelContext.entries.size, 0);
  assert.equal((await callback({})).error.code, 'inactive');
});
test('sync and async registration failures are reported', async () => {
  for (const registerTool of [() => { throw Error('sync'); }, async () => { throw Error('async'); }]) {
    const bridge = connectTools([tool], { modelContext: { registerTool } });
    assert.equal((await bridge.ready)[0].state, 'failed');
  }
});
test('execution cancellation is passed through; pre-cancelled calls do not mutate', async () => {
  const modelContext = registry(), controller = new AbortController();
  let calls = 0;
  const bridge = connectTools([{ ...tool, execute: async (_input, { signal }) => { calls++; return { sameSignal: signal === controller.signal }; } }], { modelContext });
  await bridge.ready;
  const callback = modelContext.entries.get(tool.name).execute;
  assert.equal((await callback({}, { signal: controller.signal })).sameSignal, true);
  controller.abort();
  assert.equal((await callback({}, { signal: controller.signal })).error.code, 'aborted');
  assert.equal(calls, 1);
  bridge.dispose();
  const outer = new AbortController(); outer.abort();
  const ended = connectTools([tool], { signal: outer.signal, modelContext: { registerTool() { assert.fail('must not register'); } } });
  assert.equal((await ended.ready)[0].state, 'aborted');
});
test('ending registration does not cancel an already-running invocation', async () => {
  const modelContext = registry(), execution = new AbortController(), scope = new AbortController();
  let finish;
  const bridge = connectTools([{ ...tool, execute: (_input, { signal }) => new Promise(resolve => { finish = () => resolve({ aborted: signal.aborted }); }) }], { modelContext, signal: scope.signal });
  await bridge.ready;
  const pending = modelContext.entries.get(tool.name).execute({}, { signal: execution.signal });
  scope.abort();
  assert.equal(modelContext.entries.size, 0);
  finish();
  assert.deepEqual(await pending, { aborted: false });
  bridge.dispose();
});
test('invalid or duplicate definitions fail before registration', () => {
  for (const defs of [[tool, tool], [{ ...tool, name: 'bad space' }], [{ ...tool, execute: null }]]) {
    assert.throws(() => connectTools(defs), TypeError);
  }
});
