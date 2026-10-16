import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoOnly } from '../src/lib/public-mode';
import { persistenceEnabled } from '../src/lib/persistence';
import { getProfile, getPlayerPreview, dragon, RiotError } from '../src/lib/riot';

test('modo público é opcional localmente e obrigatório na publicação inicial da Vercel', () => {
  assert.equal(demoOnly({}), false);
  assert.equal(demoOnly({ WP_DEMO_ONLY: 'false' }), false);
  assert.equal(demoOnly({ WP_DEMO_ONLY: 'true' }), true);
  assert.equal(demoOnly({ VERCEL: '1', WP_DEMO_ONLY: 'false' }), true);
  assert.equal(persistenceEnabled({ WP_DEMO_ONLY: 'true', WP_PERSISTENCE: 'enabled' }), false);
});

test('bloqueia consultas reais antes de fetch, mesmo com chave configurada; permite Data Dragon', async () => {
  const names = ['WP_DEMO_ONLY', 'VERCEL', 'RIOT_API_KEY'] as const;
  const original = Object.fromEntries(names.map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  let requests = 0;
  try {
    globalThis.fetch = async input => {
      requests++;
      assert.ok(String(input).startsWith('https://ddragon.leagueoflegends.com/'));
      return Response.json(['16.1.1']);
    };
    for (const vercel of [false, true]) {
      process.env.WP_DEMO_ONLY = vercel ? 'false' : 'true';
      if (vercel) process.env.VERCEL = '1'; else delete process.env.VERCEL;
      for (const key of ['', 'test-token']) {
        process.env.RIOT_API_KEY = key;
        const blocked = (error: unknown) => error instanceof RiotError && error.status === 503 && error.message.includes('dados fictícios');
        await assert.rejects(getProfile('br1', 'GoBacck#br1'), blocked);
        await assert.rejects(getPlayerPreview('br1', 'GoBacck#br1'), blocked);
      }
    }
    assert.equal(requests, 0);
    assert.deepEqual(await dragon('api/versions.json'), ['16.1.1']);
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      if (original[name] === undefined) delete process.env[name]; else process.env[name] = original[name];
    }
  }
});
