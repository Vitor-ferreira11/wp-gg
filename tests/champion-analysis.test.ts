import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeChampion } from '../src/lib/champion-analysis';
import type { ChampionSample } from '../src/lib/champion-stats';
const runes = {primary:8000,secondary:8300,selections:[8005,9101],shards:[5005,5008,5001]};
const samples: ChampionSample[] = [
  {id:'1',platform:'br1',patch:'16.20',queue:440,bans:[],players:[{championId:222,position:'BOTTOM',teamId:100,win:true,items:[3006,3031,3031,0],spells:[4,7],runes},{championId:22,position:'BOTTOM',teamId:200,win:false},{championId:89,position:'UTILITY',teamId:100,win:true}]},
  {id:'2',platform:'br1',patch:'16.20',queue:440,bans:[],players:[{championId:222,position:'BOTTOM',teamId:100,win:false,items:[3031,3006],spells:[7,4],runes},{championId:22,position:'BOTTOM',teamId:200,win:true},{championId:40,position:'UTILITY',teamId:100,win:false}]},
  {id:'3',platform:'br1',patch:'16.19',queue:440,bans:[],players:[{championId:222,position:'MIDDLE',win:false}]},
];
test('agrega escolhas com denominadores de cobertura e itens individuais sem duplicar',()=> {
  const data = analyzeChampion(samples,222,'ALL');
  assert.equal(data.games,3); assert.equal(data.runeGames,2);
  assert.equal(data.runes[0].games,2); assert.equal(data.runes[0].wins,1);
  assert.equal(data.spells.length,1); assert.equal(data.spells[0].games,2);
  assert.equal(data.items.find(row=>row.value===3031)?.games,2);
  assert.equal(data.itemGames,2);
});
test('confronto exige times opostos e mesma posição; sinergia é a dupla do próprio time',()=> {
  const data = analyzeChampion(samples,222,'BOTTOM');
  assert.equal(data.games,2); assert.equal(data.laneGames,2);
  assert.deepEqual(data.opponents,[{value:22,games:2,wins:1}]);
  assert.equal(data.duoGames,2); assert.equal(data.partners.length,2);
  assert.equal(data.partners.find(row=>row.value===89)?.wins,1);
  assert.equal(analyzeChampion(samples,222,'TOP').games,0);
});
