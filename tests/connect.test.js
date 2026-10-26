import test from 'node:test';
import assert from 'node:assert/strict';
import { connectTools } from '../src/connect.js';
const tool = { name: 'getBoard', description: 'Read draft', inputSchema: { type: 'object' }, execute: async () => ({ title: 'Shared' }) };

test('unsupported surface keeps direct calls usable with object results', async () => {
  const bridge = connectTools([tool], { modelContext: null });
  assert.deepEqual(await bridge.ready, [{ name: tool.name, state: 'unsupported' }]);
  assert.deepEqual(await bridge.call(tool.name), { title: 'Shared' });
  const info = bridge.list(); info[0].inputSchema.type = 'string';
  assert.equal(bridge.list()[0].inputSchema.type, 'object');
  assert.equal((await bridge.call('missing')).error.code, 'not_found');
});

test('native callback returns an object; platform would serialize once', async () => {
  const entries = new Map();
  const modelContext = { async registerTool(def, { signal }) {
    entries.set(def.name, def);
    signal.addEventListener('abort', () => entries.delete(def.name));
  } };
  const bridge = connectTools([tool], { modelContext });
  assert.equal((await bridge.ready)[0].state, 'registered');
  const result = await entries.get(tool.name).execute({});
  assert.equal(typeof result, 'object');
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { title: 'Shared' });
  bridge.dispose(); bridge.dispose();
  assert.equal(entries.size, 0);
  assert.deepEqual(bridge.list(), []);
  assert.equal((await bridge.call(tool.name)).error.code, 'inactive');
});

test('sync and async registration failures are reported separately', async () => {
  for (const registerTool of [() => { throw Error('sync'); }, async () => { throw Error('async'); }]) {
    const bridge = connectTools([tool], { modelContext: { registerTool } });
    assert.equal((await bridge.ready)[0].state, 'failed');
    assert.deepEqual(await bridge.call(tool.name), { title: 'Shared' });
  }
});

test('scope and execution cancellation reach the app', async () => {
  const controller = new AbortController();
  let calls = 0;
  const bridge = connectTools([{ ...tool, execute: async (_input, options) => { calls++; return { cancelled: options.signal.aborted }; } }], { modelContext: null });
  controller.abort();
  assert.equal((await bridge.call(tool.name, {}, { signal: controller.signal })).error.code, 'aborted');
  assert.equal(calls, 0);
  const outer = new AbortController(); outer.abort();
  const ended = connectTools([tool], { signal: outer.signal, modelContext: { registerTool() { assert.fail('must not register'); } } });
  assert.equal((await ended.ready)[0].state, 'aborted');
});

test('invalid or duplicate definitions fail before registration', () => {
  for (const defs of [[tool, tool], [{ ...tool, name: 'bad space' }], [{ ...tool, execute: null }]]) {
    assert.throws(() => connectTools(defs), TypeError);
  }
});
