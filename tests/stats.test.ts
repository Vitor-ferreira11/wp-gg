import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregate, parseRiotId, profileHref, isPlatform, csPerMinute, decodeRouteRiotId } from '../src/lib/stats';
import type { Match, Participant } from '../src/lib/types';
const participant = (overrides: Partial<Participant> = {}): Participant => ({ puuid:'test',championName:'Ahri',championId:103,kills:5,deaths:2,assists:3,win:true,totalMinionsKilled:90,neutralMinionsKilled:10,totalDamageDealtToChampions:10000,visionScore:12,teamPosition:'MIDDLE',item0:0,item1:0,item2:0,item3:0,item4:0,item5:0,item6:0,...overrides });
const match = (p: Participant): Match => ({ metadata:{matchId:'BR1_1'},info:{gameDuration:1200,gameEndTimestamp:1700000000000,queueId:420,participants:[p]} });
test('Riot ID preserva espaços e caracteres e exige nome + tag', () => {
  assert.deepEqual(parseRiotId('  João Player#BR1  '), { gameName:'João Player',tagLine:'BR1' });
  for (const id of ['abc','abc#','#br1','abc#br1#extra']) assert.throws(() => parseRiotId(id));
  assert.equal(profileHref('br1','GoBacck#br1'),'/perfil/br1/GoBacck%23br1');
  assert.equal(decodeRouteRiotId('GoBacck%23br1'),'GoBacck#br1');
  assert.equal(decodeRouteRiotId('Player%25#BR1'),'Player%25#BR1');
  assert.equal(isPlatform('br1'),true); assert.equal(isPlatform('constructor'),false);
});
test('KDA é ponderado pelas mortes e histórico ignora outros jogadores', () => {
  const stats = aggregate([match(participant()),match(participant({kills:1,assists:1,deaths:8,win:false})),match(participant({puuid:'other'}))],'test');
  assert.equal(stats.games,2); assert.equal(stats.winRate,50); assert.equal(stats.kda,'1.00'); assert.equal(stats.champions[0].games,2);
});
test('histórico vazio, KDA sem mortes e CS não dividem por zero', () => {
  assert.equal(aggregate([],'test').kda,'—');
  assert.equal(aggregate([match(participant({deaths:0}))],'test').kda,'Perfeito');
  assert.equal(csPerMinute(participant(),1200),'5.0');
  assert.equal(csPerMinute(participant(),0),'0.0');
});
