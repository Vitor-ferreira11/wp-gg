import { test } from 'node:test';
import assert from 'node:assert/strict';
import { championMetrics, type ChampionSample, cleanText } from '../src/lib/champion-stats';

const matches: ChampionSample[] = [
  {id:'1',platform:'br1',patch:'16.20',queue:440,players:[{championId:103,position:'MIDDLE',win:true},{championId:22,position:'BOTTOM',win:false}],bans:[1,1,-1]},
  {id:'2',platform:'br1',patch:'16.20',queue:440,players:[{championId:103,position:'UTILITY',win:false}],bans:[]},
];
test('vitória usa jogos do campeão; escolha e ban usam partidas', () => {
  const metrics = championMetrics(matches, 'ALL');
  assert.equal(metrics.get(103)?.winRate, 50);
  assert.equal(metrics.get(103)?.pickRate, 100);
  assert.equal(metrics.get(1)?.banRate, 50);
  assert.equal(metrics.get(1)?.winRate, null);
  assert.equal(metrics.has(-1), false);
});
test('posição restringe jogos; não duplica bans e vazio não inventa estatística', () => {
  const metrics = championMetrics(matches, 'MIDDLE');
  assert.equal(metrics.get(103)?.games, 1);
  assert.equal(metrics.get(103)?.winRate, 100);
  assert.equal(metrics.get(103)?.pickRate, 50);
  assert.equal(metrics.get(1)?.bans, 1);
  assert.equal(championMetrics([], 'ALL').size, 0);
  assert.equal(cleanText('<b>Dano</b>&nbsp;&amp; cura'), 'Dano & cura');
});
