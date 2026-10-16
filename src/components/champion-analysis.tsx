'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { analyzeChampion, type AnalysisAssets } from '@/lib/champion-analysis';
import type { ChampionSample } from '@/lib/champion-stats';
import type { Champion } from '@/lib/types';

const percent = (wins:number,games:number) => games ? `${(wins/games*100).toFixed(1)}%` : '—';
const shards: Record<number,string> = {5008:'Força adaptativa',5005:'Velocidade de ataque',5007:'Aceleração de habilidade',5001:'Vida',5002:'Armadura',5003:'Resistência mágica'};
export function ChampionAnalysis({ samples, championId, champions, version, assets, unavailable, disabled = false }: { samples: ChampionSample[]; championId: number; champions: Champion[]; version: string; assets: AnalysisAssets | null; unavailable: boolean; disabled?: boolean }) {
  const [position,setPosition] = useState('ALL');
  const [queue,setQueue] = useState('ALL');
  const [patch,setPatch] = useState('ALL');
  const patches = [...new Set(samples.map(s=>s.patch))].sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
  const filtered = useMemo(()=>samples.filter(s=>(queue==='ALL'||s.queue===Number(queue))&&(patch==='ALL'||patch===s.patch)),[samples,queue,patch]);
  const data = useMemo(()=>analyzeChampion(filtered,championId,position),[filtered,championId,position]);
  const runeMap = new Map(assets?.runes.flatMap(style=>[style,...style.slots.flatMap(slot=>slot.runes)]).map(r=>[r.id,r]));
  const spellMap = new Map(Object.values(assets?.spells ?? {}).map(s=>[Number(s.key),s]));
  const champMap = new Map(champions.map(c=>[Number(c.key),c]));
  const icon = (id:number,kind:'item'|'spell'|'rune') => {
    const item = kind==='item'?assets?.items[id]:kind==='spell'?spellMap.get(id):null;
    const rune = kind==='rune'?runeMap.get(id):null;
    const name = item?.name ?? rune?.name ?? `${kind==='item'?'Item':kind==='spell'?'Feitiço':'Runa'} ${id}`;
    const src = rune ? `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}` : item ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/${kind==='item'?'item':'spell'}/${item.image.full}` : null;
    return <span key={`${kind}-${id}`} className="loadout-icon" title={name}>{src ? <Image src={src} alt={name} width={32} height={32}/> : <span>{id}</span>}</span>;
  };
  const usage = (games:number,wins:number,total:number) => <div className="usage-metrics"><strong>{games} jogos</strong><span>{percent(games,total)} de uso</span><span>{percent(wins,games)} de vitória</span></div>;
  const opponentList = (rows:typeof data.opponents) => rows.length ? rows.map(row=> {
    const c=champMap.get(row.value);
    return <div key={row.value} className="matchup-row">{c?<Link href={`/campeoes/${c.id}`} className="matchup-name"><Image src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`} alt="" width={34} height={34}/><span>{c.name}</span></Link>:<span>Campeão {row.value}</span>}<div><strong>{percent(row.wins,row.games)}</strong><small>{row.games} jogos · {row.wins} vitórias</small></div></div>;
  }) : <p className="analysis-empty">Nenhuma observação com posição e time disponíveis.</p>;
  if (disabled) return <section className="champion-analysis" aria-labelledby="analysis-title"><h2 id="analysis-title">Análise do campeão</h2><p className="sample-notice">Estatísticas acumuladas desativadas neste ambiente. Habilidades, atributos e skins continuam disponíveis pelo Data Dragon. Perfis e partidas recentes não dependem deste armazenamento.</p></section>;
  return <section className="champion-analysis" aria-labelledby="analysis-title">
    <div className="section-heading"><div><h2 id="analysis-title">Análise do campeão</h2><p className="muted">Escolhas observadas nas partidas coletadas. Amostras pequenas não são recomendações.</p></div></div>
    <div className="analysis-filters"><label>Posição<select value={position} onChange={e=>setPosition(e.target.value)}>{[['ALL','Todas'],['TOP','Topo'],['JUNGLE','Selva'],['MIDDLE','Meio'],['BOTTOM','Atirador'],['UTILITY','Suporte']].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>Fila<select value={queue} onChange={e=>setQueue(e.target.value)}><option value="ALL">Solo/Duo + Flex</option><option value="420">Solo / Duo</option><option value="440">Flex</option></select></label><label>Patch das partidas<select value={patch} onChange={e=>setPatch(e.target.value)}><option value="ALL">Todos os coletados</option>{patches.map(p=><option key={p}>{p}</option>)}</select></label><span className="analysis-total">{data.games} jogos · {percent(data.wins,data.games)} de vitória</span></div>
    {unavailable && <p className="sample-notice">Não foi possível ler a amostra local. Tente novamente mais tarde.</p>}
    {!data.games && <p className="sample-notice">Nenhuma partida deste campeão nos filtros selecionados. Consulte perfis que tenham jogado com ele para ampliar a amostra.</p>}
    <div className="analysis-layout"><div className="analysis-primary">
      <section className="panel analysis-panel"><h3>Runas mais usadas</h3><p>{data.runeGames} jogos com página de runas disponível.</p>{data.runes.length ? data.runes.map((row,i)=><div className="observed-loadout" key={i}><div className="rune-tree-label">{runeMap.get(row.value.primary)?.name ?? row.value.primary} + {runeMap.get(row.value.secondary)?.name ?? row.value.secondary}</div><div className="loadout-icons">{row.value.selections.map(id=>icon(id,'rune'))}</div><p className="shard-label">Fragmentos: {row.value.shards.map(id=>shards[id] ?? `#${id}`).join(' · ')}</p>{usage(row.games,row.wins,data.runeGames)}</div>):<p className="analysis-empty">Sem páginas de runas na amostra. Reconsulte os perfis para atualizar partidas antigas.</p>}</section>
      <section className="panel analysis-panel"><h3>Feitiços de invocador</h3><p>{data.spellGames} jogos com feitiços disponíveis.</p>{data.spells.length?data.spells.map((row,i)=><div className="observed-loadout spell-loadout" key={i}><div className="loadout-icons">{row.value.map(id=>icon(id,'spell'))}</div>{usage(row.games,row.wins,data.spellGames)}</div>):<p className="analysis-empty">Sem feitiços na amostra.</p>}</section>
      <section className="panel analysis-panel"><h3>Conjuntos de itens finais</h3><p>{data.itemGames} jogos com itens disponíveis. Os conjuntos não indicam ordem de compra.</p>{data.builds.length?data.builds.map((row,i)=><div className="observed-loadout" key={i}><div className="loadout-icons">{row.value.map((id,index)=><span key={`${id}-${index}`}>{icon(id,'item')}</span>)}</div>{usage(row.games,row.wins,data.itemGames)}</div>):<p className="analysis-empty">Sem itens finais na amostra.</p>}</section>
      <section className="panel analysis-panel"><h3>Itens mais presentes</h3><p>Frequência nos inventários finais; inclui componentes e consumíveis.</p>{data.items.length?data.items.map(row=><div className="observed-loadout spell-loadout" key={row.value}><div className="item-name">{icon(row.value,'item')}<span>{assets?.items[row.value]?.name ?? `Item ${row.value}`}</span></div>{usage(row.games,row.wins,data.itemGames)}</div>):<p className="analysis-empty">Sem itens na amostra.</p>}</section>
    </div><aside className="analysis-secondary">
      <section className="panel analysis-panel"><h3>Confrontos na posição</h3><p>Vitórias deste campeão contra o adversário da mesma posição. {data.laneGames} jogos.</p>{opponentList(data.opponents)}</section>
      <section className="panel analysis-panel"><h3>Sinergias na rota inferior</h3><p>Duplas de atirador e suporte observadas no mesmo time. {data.duoGames} jogos.</p>{opponentList(data.partners)}</section>
      <section className="panel analysis-panel"><h3>Dados que ainda faltam</h3><p>Itens iniciais, ordem de compra e evolução das habilidades exigem a timeline da partida. Ranking global de maestria e popularidade de skins exigem outras fontes e uma coleta própria.</p></section>
    </aside></div>
    {!assets && <p className="analysis-empty">Catálogo de runas, feitiços ou itens indisponível; os IDs são exibidos como alternativa.</p>}
    <p className="champion-method">Uso é calculado sobre os jogos com dados disponíveis em cada seção. As taxas descrevem a amostra local e não medem a força global do campeão. Ícones usam o catálogo atual e podem diferir de patches antigos.</p>
  </section>;
}
