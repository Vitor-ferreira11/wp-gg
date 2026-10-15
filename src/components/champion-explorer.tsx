'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Champion } from '@/lib/types';
import { championMetrics, championClass, type ChampionSample } from '@/lib/champion-stats';
import { platforms } from '@/lib/stats';

const roles = [['ALL', 'Todos'], ['TOP', 'Topo'], ['JUNGLE', 'Selva'], ['MIDDLE', 'Meio'], ['BOTTOM', 'Atirador'], ['UTILITY', 'Suporte']];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const rate = (value?: number | null) => value == null ? '—' : `${value.toFixed(1)}%`;
export function ChampionExplorer({ champions, version, samples, unavailable }: { champions: Champion[]; version: string; samples: ChampionSample[]; unavailable: boolean }) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [region, setRegion] = useState('ALL');
  const [queue, setQueue] = useState('ALL');
  const [patch, setPatch] = useState('ALL');
  const [sort, setSort] = useState('games');
  const patches = [...new Set(samples.map(s => s.patch))].sort((a,b) => b.localeCompare(a, undefined, { numeric: true }));
  const filtered = useMemo(() => samples.filter(s => (region === 'ALL' || s.platform === region) && (queue === 'ALL' || s.queue === Number(queue)) && (patch === 'ALL' || s.patch === patch)), [samples, region, queue, patch]);
  const metrics = useMemo(() => championMetrics(filtered, role), [filtered, role]);
  const list = champions.filter(c => normalize(c.name).includes(normalize(search)) && (role === 'ALL' || (metrics.get(Number(c.key))?.games ?? 0) > 0)).sort((a,b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'pt-BR');
    const field = sort as 'games' | 'winRate' | 'pickRate' | 'banRate';
    return (metrics.get(Number(b.key))?.[field] ?? -1) - (metrics.get(Number(a.key))?.[field] ?? -1) || a.name.localeCompare(b.name, 'pt-BR');
  });
  return <>
    <div className="champion-tools"><label className="champion-search"><Search size={18}/><span className="sr-only">Buscar campeão</span><input placeholder="Buscar campeão…" value={search} onChange={e => setSearch(e.target.value)}/></label><label>Servidor<select value={region} onChange={e => setRegion(e.target.value)}><option value="ALL">Todos</option>{Object.entries(platforms).map(([id,p]) => <option key={id} value={id}>{p.label}</option>)}</select></label><label>Fila<select value={queue} onChange={e => setQueue(e.target.value)}><option value="ALL">Solo/Duo + Flex</option><option value="420">Solo / Duo</option><option value="440">Flex</option></select></label><label>Patch das partidas<select value={patch} onChange={e => setPatch(e.target.value)}><option value="ALL">Todos os coletados</option>{patches.map(p => <option key={p}>{p}</option>)}</select></label></div>
    <div className="champion-roles" role="group" aria-label="Posição nas partidas">{roles.map(([id,label]) => <button key={id} aria-pressed={role === id} className={role === id ? 'active' : ''} onClick={() => setRole(id)}>{label}</button>)}</div>
    <div className="sample-notice"><strong>{filtered.length} partidas na amostra</strong><p>{unavailable ? 'Não foi possível ler as estatísticas locais. O catálogo continua disponível.' : 'Estatísticas locais, coletadas ao consultar perfis. Não representam o desempenho global. Posições são as observadas nessas partidas.'}</p>{!samples.length && <Link href="/perfil/br1/GoBacck%23br1">Consultar GoBacck para coletar partidas →</Link>}</div>
    <div className="champion-list-heading"><p>{list.length} campeões</p><label>Ordenar por <select value={sort} onChange={e => setSort(e.target.value)}><option value="games">Mais jogados</option><option value="name">Nome A–Z</option><option value="winRate">Taxa de vitória</option><option value="pickRate">Taxa de escolha</option><option value="banRate">Taxa de banimento</option></select></label></div>
    <div className="champion-table-scroll" role="region" aria-label="Lista e estatísticas dos campeões" tabIndex={0}><table className="champion-table"><caption className="sr-only">Campeões e estatísticas da amostra filtrada</caption><thead><tr><th scope="col">Campeão</th><th scope="col">Classe</th><th scope="col">Jogos</th><th scope="col">Vitória</th><th scope="col">Escolha</th><th scope="col">Banimento</th></tr></thead><tbody>{list.map(c => {
      const metric = metrics.get(Number(c.key));
      return <tr key={c.id}><th scope="row"><Link className="champion-list-name" href={`/campeoes/${c.id}`}><Image src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`} alt="" width={42} height={42}/><span>{c.name}<small>{c.title}</small></span></Link></th><td>{c.tags?.map(championClass).join(' · ') ?? '—'}</td><td>{metric?.games ?? 0}</td><td><strong>{rate(metric?.winRate)}</strong></td><td>{rate(metric?.pickRate)}</td><td>{rate(metric?.banRate)}</td></tr>;
    })}</tbody></table></div>
    {!list.length && <div className="panel champion-empty"><h2>Nenhum campeão encontrado</h2><p className="muted">Tente outro nome ou posição. Sem partidas nessa posição, não há estatísticas para listar.</p><button className="button" onClick={() => { setSearch(''); setRole('ALL'); setRegion('ALL'); setQueue('ALL'); setPatch('ALL'); }}>Limpar filtros</button></div>}
    <p className="champion-method">Vitória: vitórias / jogos do campeão. Escolha: jogos do campeão / partidas filtradas{role === 'ALL' ? '' : `, na posição selecionada`}. Banimento: partidas em que o campeão foi banido / partidas filtradas. Amostras pequenas não determinam os melhores campeões.</p>
  </>;
}
