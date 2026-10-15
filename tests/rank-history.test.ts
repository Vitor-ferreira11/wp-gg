import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import { recordRankHistory, historyDay, captureRankHistory } from '../src/lib/rank-history';
import type { League } from '../src/lib/types';

const files: string[] = [];
const databasePath = () => { const path = join(tmpdir(), `wp-gg-history-test-${randomUUID()}.sqlite`); files.push(path); return path; };
afterEach(() => { for (const file of files.splice(0)) if (existsSync(file)) unlinkSync(file); });
const league = (leaguePoints: number): League => ({ queueType: 'RANKED_FLEX_SR', tier: 'PLATINUM', rank: 'I', leaguePoints, wins: 19, losses: 19 });

test('histórico persiste, atualiza no mesmo dia e preserva dias anteriores', () => {
  const path = databasePath();
  recordRankHistory('player', 'br1', [league(71)], new Date('2026-10-13T15:00:00Z'), path);
  let entries = recordRankHistory('player', 'br1', [league(90)], new Date('2026-10-13T18:00:00Z'), path);
  assert.equal(entries.length, 2);
  assert.equal(entries.find(s => s.queueType === 'RANKED_FLEX_SR')?.leaguePoints, 90);
  entries = recordRankHistory('player', 'br1', [league(100)], new Date('2026-10-14T15:00:00Z'), path);
  assert.equal(entries.length, 4);
  assert.equal(entries[0].day, '2026-10-14');
  assert.equal(entries.find(s => s.day === '2026-10-13' && s.queueType === 'RANKED_FLEX_SR')?.leaguePoints, 90);
  assert.equal(entries.find(s => s.queueType === 'RANKED_SOLO_5x5')?.tier, null);
});
test('não mistura jogadores ou servidores e observação antiga não sobrescreve recente', () => {
  const path = databasePath();
  recordRankHistory('a', 'br1', [league(90)], new Date('2026-10-13T18:00:00Z'), path);
  const entries = recordRankHistory('a', 'br1', [league(10)], new Date('2026-10-13T15:00:00Z'), path);
  assert.equal(entries.find(s => s.queueType === 'RANKED_FLEX_SR')?.leaguePoints, 90);
  assert.equal(recordRankHistory('b', 'br1', [], new Date('2026-10-14T15:00:00Z'), path).length, 2);
  assert.equal(recordRankHistory('a', 'na1', [], new Date('2026-10-14T15:00:00Z'), path).length, 2);
});
test('dia usa Brasília e falha de armazenamento é explícita sem derrubar perfil', () => {
  assert.equal(historyDay(new Date('2026-10-14T01:00:00Z')), '2026-10-13');
  const path = databasePath();
  recordRankHistory('a', 'br1', [], new Date(), path);
  const original = process.env.WP_DATABASE_PATH;
  try { process.env.WP_DATABASE_PATH = join(path, 'impossible.sqlite'); assert.deepEqual(captureRankHistory('a', 'br1', []), { snapshots: [], unavailable: true }); }
  finally { if (original === undefined) delete process.env.WP_DATABASE_PATH; else process.env.WP_DATABASE_PATH = original; }
});
