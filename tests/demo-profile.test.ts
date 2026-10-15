import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDemoProfile } from '../src/lib/demo-profile';
import { aggregate } from '../src/lib/stats';
import { championRelations } from '../src/lib/champion-relations';

test('demonstração funciona sem chave ou rede e usa identificadores fictícios', () => {
  const fetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('A demonstração não pode consultar a API'); };
  try {
    const profile = getDemoProfile();
    assert.equal(profile.account.tagLine, 'DEMO');
    assert.equal(profile.matches.length, 20);
    assert.equal(new Set(profile.matches.map(match => match.metadata.matchId)).size, 20);
    for (const match of profile.matches) {
      assert.equal(match.info.participants.length, 10);
      assert.equal(match.metadata.matchId.startsWith('DEMO_'), true);
      assert.equal(match.info.participants.filter(player => player.puuid === profile.account.puuid).length, 1);
      assert.equal(match.info.participants.every(player => !player.riotIdGameName && !player.riotIdTagline), true);
    }
    assert.deepEqual(profile.rankHistory.snapshots, []);
  } finally { globalThis.fetch = fetch; }
});

test('dados de demonstração são consistentes e cobrem os filtros e relacionamentos', () => {
  const profile = getDemoProfile();
  const stats = aggregate(profile.matches, profile.account.puuid);
  assert.equal(stats.games, 20);
  assert.equal(stats.wins, 12);
  assert.equal(stats.losses, 8);
  assert.equal(stats.winRate, 60);
  assert.equal(stats.champions[0].name, 'Jinx');
  assert.deepEqual([...new Set(profile.matches.map(match => match.info.queueId))].sort(), [420, 440, 450]);
  const relations = championRelations(profile.matches, profile.account.puuid);
  assert.equal(relations.allies.length, 5);
  assert.equal(relations.enemies.length, 5);
  assert.deepEqual(getDemoProfile(), profile);
});
