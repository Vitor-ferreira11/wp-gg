import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import { captureChampionSamples, readChampionSamples } from '../src/lib/champion-samples';
import type { Match } from '../src/lib/types';

test('armazena uma vez por partida, exclui filas não ranqueadas e não salva identificadores de jogadores', () => {
  const path = join(tmpdir(), `wp-gg-champions-${randomUUID()}.sqlite`);
  const original = process.env.WP_DATABASE_PATH;
  process.env.WP_DATABASE_PATH = path;
  try {
    const match = { metadata: { matchId: 'BR1_1' }, info: { queueId: 440, gameVersion: '16.20.1.1', teams: [{ bans: [{ championId: 22 }] }], participants: Array.from({length:10}, (_,i) => ({puuid:`private-${i}`,championId:i+1,teamPosition:'TOP',win:i<5})) } } as Match;
    captureChampionSamples([match, match, { ...match, metadata: { matchId: 'BR1_2' }, info: { ...match.info, queueId: 450 } }]);
    const result = readChampionSamples();
    assert.equal(result.unavailable, false);
    assert.equal(result.samples.length, 1);
    assert.equal(result.samples[0].patch, '16.20');
    assert.deepEqual(result.samples[0].bans, [22]);
    assert.ok(!JSON.stringify(result.samples).includes('private-'));
  } finally {
    if (original === undefined) delete process.env.WP_DATABASE_PATH; else process.env.WP_DATABASE_PATH = original;
    if (existsSync(path)) unlinkSync(path);
  }
});
