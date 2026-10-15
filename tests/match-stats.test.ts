import { test } from 'node:test';
import assert from 'node:assert/strict';
import { killParticipation, matchTeams } from '../src/lib/match-stats';
import type { Participant } from '../src/lib/types';

const player = (values: Partial<Participant>): Participant => ({ puuid: 'a', championName: 'Ahri', championId: 103, kills: 1, deaths: 0, assists: 2, win: true, totalMinionsKilled: 10, neutralMinionsKilled: 0, totalDamageDealtToChampions: 100, visionScore: 5, teamPosition: 'MIDDLE', item0: 0, item1: 0, item2: 0, item3: 0, item4: 0, item5: 0, item6: 0, ...values });

test('separa times por ID, ordena posições e soma apenas o próprio time', () => {
  const input = [player({teamId: 200, win: false, kills: 4}), player({teamId: 100, teamPosition: 'UTILITY', goldEarned: 1000}), player({teamId: 100, teamPosition: 'TOP', goldEarned: 2000, kills: 2})];
  const teams = matchTeams(input);
  assert.deepEqual(teams.map(t => t.id), [100, 200]);
  assert.equal(teams[0].players[0].teamPosition, 'TOP');
  assert.equal(teams[0].kills, 3); assert.equal(teams[0].gold, 3000);
  assert.equal(teams[1].win, false); assert.equal(teams[1].gold, null);
  assert.equal(input[0].teamId, 200);
});
test('participação em abates trata zero e não confunde times desconhecidos', () => {
  assert.equal(killParticipation(player({}), 6), 50);
  assert.equal(killParticipation(player({}), 0), 0);
  assert.equal(matchTeams([player({})])[0].win, null);
  assert.deepEqual(matchTeams([]), []);
});
