import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { persistenceEnabled } from '../src/lib/persistence';
import { captureChampionSamples, readChampionSamples } from '../src/lib/champion-samples';
import { captureRankHistory, recordRankHistory } from '../src/lib/rank-history';
import { getDemoProfile } from '../src/lib/demo-profile';
import { getProfile } from '../src/lib/riot';

test('preserva o padrão local, permite desativar e nunca habilita SQLite na Vercel', () => {
  assert.equal(persistenceEnabled({}), true);
  assert.equal(persistenceEnabled({ WP_PERSISTENCE: 'disabled' }), false);
  assert.equal(persistenceEnabled({ VERCEL: '1' }), false);
  assert.equal(persistenceEnabled({ VERCEL: '1', WP_PERSISTENCE: 'enabled' }), false);
});

test('modo sem persistência não cria diretório nem banco e mantém perfil completo', async () => {
  const names = ['WP_PERSISTENCE', 'WP_DATABASE_PATH', 'RIOT_API_KEY', 'VERCEL'] as const;
  const original = Object.fromEntries(names.map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  const directory = join(tmpdir(), `wp-disabled-${randomUUID()}`);
  const fixture = getDemoProfile();
  try {
    delete process.env.VERCEL;
    process.env.WP_PERSISTENCE = 'disabled';
    process.env.WP_DATABASE_PATH = join(directory, 'data.sqlite');
    process.env.RIOT_API_KEY = 'test-token';
    captureChampionSamples(fixture.matches);
    assert.deepEqual(readChampionSamples(), { samples: [], unavailable: false, disabled: true });
    assert.deepEqual(recordRankHistory('test', 'br1', []), []);
    assert.deepEqual(captureRankHistory('test', 'br1', []), { snapshots: [], unavailable: false });
    globalThis.fetch = async input => {
      const url = String(input);
      if (url.includes('/accounts/')) return Response.json(fixture.account);
      if (url.includes('/summoners/')) return Response.json(fixture.summoner);
      if (url.includes('/entries/')) return Response.json(fixture.leagues);
      if (url.includes('/ids?')) return Response.json(fixture.matches.map(match => match.metadata.matchId));
      if (url.includes('versions.json')) return Response.json([fixture.version]);
      if (url.includes('champion.json')) return Response.json({ data: fixture.champions });
      const match = fixture.matches.find(match => url.endsWith('/' + match.metadata.matchId));
      assert.ok(match);
      return Response.json(match);
    };
    const profile = await getProfile('br1', 'WePlay Demo#DEMO');
    assert.equal(profile.matches.length, 20);
    assert.deepEqual(profile.summoner, fixture.summoner);
    assert.deepEqual(profile.leagues, fixture.leagues);
    assert.equal(existsSync(directory), false);
    process.env.WP_PERSISTENCE = 'enabled';
    process.env.VERCEL = '1';
    captureChampionSamples(fixture.matches);
    assert.equal(readChampionSamples().disabled, true);
    assert.deepEqual(recordRankHistory('test', 'br1', []), []);
    assert.equal(existsSync(directory), false);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      if (original[name] === undefined) delete process.env[name];
      else process.env[name] = original[name];
    }
  }
});
