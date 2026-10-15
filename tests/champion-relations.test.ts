import { test } from 'node:test';
import assert from 'node:assert/strict';
import { championRelations } from '../src/lib/champion-relations';
import type { Match, Participant } from '../src/lib/types';

const player = (puuid: string, championId: number, teamId: number): Participant => ({ puuid, championId, championName: String(championId), teamId, win: false, kills: 0, deaths: 0, assists: 0, totalMinionsKilled: 0, neutralMinionsKilled: 0, totalDamageDealtToChampions: 0, visionScore: 0, teamPosition: '', item0: 0, item1: 0, item2: 0, item3: 0, item4: 0, item5: 0, item6: 0 });
const match = (id: string, win: boolean): Match => ({ metadata: { matchId: id }, info: { gameDuration: 1200, gameEndTimestamp: 0, queueId: 420, participants: [{ ...player('me', 103, 100), win }, player('ally', 89, 100), player('enemy', 222, 200)] } });

test('separa aliados e adversários e usa o resultado do jogador consultado', () => {
  const result = championRelations([match('1', true), match('2', false), match('3', true)], 'me');
  assert.equal(result.games, 3);
  assert.deepEqual(result.allies, [{ id: 89, name: '89', games: 3, wins: 2, losses: 1 }]);
  assert.deepEqual(result.enemies, [{ id: 222, name: '222', games: 3, wins: 2, losses: 1 }]);
});
test('ignora duplicatas, remakes, jogador ausente e equipes desconhecidas', () => {
  const normal = match('1', true);
  const remake = match('2', false); remake.info.gameDuration = 299;
  const unknown = match('3', false); unknown.info.participants[0].teamId = undefined;
  assert.deepEqual(championRelations([normal, normal, remake, unknown], 'me'), { games: 1, allies: [], enemies: [] });
  assert.equal(championRelations([normal], 'missing').games, 0);
});
test('conta cada campeão uma vez por lado e prioriza quantidade de resultados', () => {
  const matches = [match('1', true), match('2', true), match('3', false)];
  matches[0].info.participants.push(player('duplicate', 89, 100));
  for (const m of matches) m.info.participants.push(player('other', 12, 100));
  const result = championRelations(matches, 'me');
  assert.equal(result.allies.find(row => row.id === 89)?.games, 3);
  assert.equal(result.allies.length, 2);
  assert.deepEqual(championRelations([], 'me'), { games: 0, allies: [], enemies: [] });
});
