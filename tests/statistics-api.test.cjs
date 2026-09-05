const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const ts = require('typescript');

// Exercise the real route handlers, replacing only external database access.
function handlers(client) {
  const source = readFileSync(require.resolve('../app/api/statistics/route.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  const load = name => {
    if (name === '@/lib/supabase-server') return { createSupabaseServerClient: () => client };
    if (name === '@/app/components/statistics/registry') return { statisticResources: [
      { key: 'tool/audio/audio-clipper', kind: 'tool' }, { key: 'blog/example', kind: 'blog' },
    ] };
    return require(name);
  };
  new Function('require', 'module', 'exports', code)(load, module, module.exports);
  return module.exports;
}
const event = { resource: 'tool/audio/audio-clipper', event: 'complete', visitor: '11111111-1111-4111-8111-111111111111', eventId: '22222222-2222-4222-8222-222222222222' };
const request = (body, origin = 'https://example.com') => new Request('https://example.com/api/statistics', {
  method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('missing or failing statistics backend is unavailable, never a fabricated zero', async () => {
  for (const db of [null, { rpc: async () => ({ error: new Error('missing migration') }) }, { rpc: async () => { throw new Error('offline'); } }]) {
    const route = handlers(db);
    assert.equal((await route.GET()).status, 503);
    assert.equal((await route.POST(request(event))).status, 503);
  }
});

test('valid events forward exactly the metadata needed by the database', async () => {
  const calls = [];
  const route = handlers({ rpc: async (...args) => { calls.push(args); return { error: null }; } });
  for (const item of [event, { ...event, event: 'visit' }, { ...event, resource: 'blog/example', event: 'open' }]) {
    assert.equal((await route.POST(request(item))).status, 204);
  }
  assert.deepEqual(calls[0], ['record_resource_event', {
    p_resource: event.resource, p_visitor: event.visitor, p_event_id: event.eventId, p_event: 'complete',
  }]);
});

test('invalid events and cross-origin submissions never reach Supabase', async () => {
  const route = handlers({ rpc: () => assert.fail('invalid event reached database') });
  for (const body of [null, 'invalid json', {}, { ...event, visitor: 'bad' }, { ...event, eventId: 'bad' }, { ...event, resource: 'unknown' }, { ...event, event: 'open' }, { ...event, resource: 'blog/example', event: 'complete' }, { ...event, resource: 'blog/example', event: 'visit' }]) {
    assert.equal((await route.POST(request(body))).status, 400);
  }
  assert.equal((await route.POST(request(event, 'https://other.example'))).status, 403);
  assert.equal((await route.POST(request('x'.repeat(1025)))).status, 413);
});

test('aggregate response disables caching and returns database totals', async () => {
  const stats = [{ resource_key: event.resource, visitors: 12, completed: 4, opens: 0 }];
  const route = handlers({ rpc: async name => { assert.equal(name, 'read_resource_statistics'); return { data: stats, error: null }; } });
  const response = await route.GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { stats });
});
