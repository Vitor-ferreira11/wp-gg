import Image from 'next/image';
import { asset } from '@/lib/riot';
import { csPerMinute, playerIn, queueLabel } from '@/lib/stats';
import type { Match, Champion } from '@/lib/types';
import { MatchTeams } from './match-teams';
export function MatchCard({ match, puuid, version, champions }: { match: Match; puuid: string; version: string; champions: Record<string, Champion> }) {
  const p = playerIn(match, puuid); if (!p) return null;
  const champion = Object.values(champions).find(c => Number(c.key) === p.championId);
  const date = new Intl.DateTimeFormat('pt-BR', { day:'2-digit',month:'short', hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' }).format(new Date(match.info.gameEndTimestamp));
  const items = [p.item0,p.item1,p.item2,p.item3,p.item4,p.item5,p.item6];
  return <article className={`match-card ${p.win ? 'win' : 'loss'}`}><div className="match-result"><strong>{p.win ? 'Vitória' : 'Derrota'}</strong><span>{queueLabel(match.info.queueId)}</span><small>{date} · {Math.floor(match.info.gameDuration / 60)}m {match.info.gameDuration % 60}s</small></div><div className="match-champion">{champion ? <Image src={asset(version,'champion',champion.id)} alt={champion.name} width={52} height={52}/> : <span className="champion-placeholder">?</span>}<div><strong>{champion?.name ?? p.championName}</strong><small>{({TOP:'Topo',JUNGLE:'Selva',MIDDLE:'Meio',BOTTOM:'Atirador',UTILITY:'Suporte'}[p.teamPosition] ?? '—')}</small></div></div><div className="match-kda"><strong>{p.kills} <span>/ {p.deaths} /</span> {p.assists}</strong><small>{p.deaths ? ((p.kills+p.assists)/p.deaths).toFixed(2)+' KDA' : 'KDA perfeito'}</small></div><div className="match-farm"><strong>{p.totalMinionsKilled+p.neutralMinionsKilled} CS</strong><small>{csPerMinute(p,match.info.gameDuration)} / min</small></div><div className="items" aria-label="Itens da partida">{items.map((item,index) => item ? <Image key={index} src={asset(version,'item',item)} alt={`Item ${item}`} title={`Item ${item}`} width={28} height={28}/> : <span key={index} className="empty-item"/>)}</div><details className="match-detail"><summary>Mais detalhes</summary><MatchTeams match={match} puuid={puuid} version={version} champions={champions}/></details></article>;
}

