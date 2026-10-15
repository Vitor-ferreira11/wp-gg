import Image from 'next/image';
import Link from 'next/link';
import { championRelations } from '@/lib/champion-relations';
import { asset } from '@/lib/riot';
import type { Champion, Match } from '@/lib/types';

export function ChampionRelations({ matches, puuid, champions, version }: { matches: Match[]; puuid: string; champions: Record<string, Champion>; version: string }) {
  const stats = championRelations(matches, puuid);
  const catalog = new Map(Object.values(champions).map(champion => [Number(champion.key), champion]));
  return <section className="relations-section" aria-labelledby="relations-title">
    <div className="section-heading"><div><h2 id="relations-title">Campeões ao seu lado e contra você</h2><p className="muted">Resultados nas {stats.games} partidas recentes analisadas · Todas as filas.</p></div></div>
    <div className="relations-grid">{([
      { key: 'allies', title: 'Aliados com mais vitórias', description: 'Com estes campeões no seu time.', result: 'wins', label: 'vitórias' },
      { key: 'enemies', title: 'Adversários com mais derrotas', description: 'Contra estes campeões no time adversário.', result: 'losses', label: 'derrotas' },
    ] as const).map(group => <article key={group.key} className={`panel relations-panel relations-${group.key}`}>
      <h3>{group.title}</h3><p className="muted">{group.description}</p>
      {stats[group.key].length ? <ul className="relations-list">{stats[group.key].map(row => {
        const champion = catalog.get(row.id);
        const content = <>{champion && <Image src={asset(version, 'champion', champion.id)} alt="" width={40} height={40}/>}<div className="relation-name"><strong>{champion?.name ?? row.name}</strong><small>{row.wins}V · {row.losses}D · {row.games} partidas</small></div><div className="relation-rate"><strong>{Math.round(row[group.result] / row.games * 100)}%</strong><small>{group.label}</small></div></>;
        return <li key={row.id}>{champion ? <Link href={`/campeoes/${champion.id}`}>{content}</Link> : <div className="relation-row">{content}</div>}</li>;
      })}</ul> : <p className="relations-empty muted">Ainda não há campeões com pelo menos duas partidas e {group.label} nesta amostra.</p>}
    </article>)}</div>
    <p className="history-note">Ordenado pelo total de vitórias ou derrotas, com no mínimo 2 partidas por campeão. Seu próprio campeão e jogos com menos de 5 minutos são excluídos. A amostra é pequena: estes resultados não garantem o desempenho em jogos futuros.</p>
  </section>;
}
