import type { Match, Participant } from './types';
export const platforms = { br1: { label: 'Brasil', region: 'americas' }, na1: { label: 'América do Norte', region: 'americas' }, la1: { label: 'LAN', region: 'americas' }, la2: { label: 'LAS', region: 'americas' }, euw1: { label: 'Europa Oeste', region: 'europe' }, eun1: { label: 'Europa Nórdica', region: 'europe' }, kr: { label: 'Coreia', region: 'asia' }, jp1: { label: 'Japão', region: 'asia' } } as const;
export type Platform = keyof typeof platforms;
export function decodeRouteRiotId(value: string) {
  if (value.includes('#')) return value;
  try { return decodeURIComponent(value); } catch { return value; }
}
export function isPlatform(value: string): value is Platform { return Object.hasOwn(platforms, value); }
export function parseRiotId(value: string) {
  const parts = value.trim().split('#');
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim() || parts[0].length > 32 || parts[1].length > 16) throw new Error('Use o formato Nome#TAG, por exemplo GoBacck#br1.');
  return { gameName: parts[0].trim(), tagLine: parts[1].trim() };
}
export function profileHref(platform: string, riotId: string) { return `/perfil/${platform}/${encodeURIComponent(riotId)}`; }
export function playerIn(match: Match, puuid: string) { return match.info.participants.find(p => p.puuid === puuid); }
export function aggregate(matches: Match[], puuid: string) {
  const players = matches.flatMap(m => { const p = playerIn(m, puuid); return p ? [p] : []; });
  const sum = (field: 'kills' | 'deaths' | 'assists') => players.reduce((n, p) => n + p[field], 0);
  const wins = players.filter(p => p.win).length;
  const deaths = sum('deaths');
  const champions = new Map<string, { name: string; id: number; games: number; wins: number }>();
  players.forEach(p => { const c = champions.get(p.championName) ?? { name: p.championName, id: p.championId, games: 0, wins: 0 }; c.games++; c.wins += Number(p.win); champions.set(p.championName, c); });
  return { games: players.length, wins, losses: players.length - wins, winRate: players.length ? Math.round(wins / players.length * 100) : 0, kda: deaths ? ((sum('kills') + sum('assists')) / deaths).toFixed(2) : players.length ? 'Perfeito' : '—', kills: players.length ? (sum('kills') / players.length).toFixed(1) : '0', deaths: players.length ? (deaths / players.length).toFixed(1) : '0', assists: players.length ? (sum('assists') / players.length).toFixed(1) : '0', champions: [...champions.values()].sort((a,b) => b.games - a.games).slice(0, 4) };
}
export const queueLabel = (id: number) => ({ 420: 'Ranqueada Solo/Duo', 440: 'Ranqueada Flex', 450: 'ARAM', 400: 'Normal alternada', 430: 'Normal às cegas', 490: 'Normal rápida', 1700: 'Arena' }[id] ?? `Fila ${id}`);
export function csPerMinute(p: Participant, duration: number) { return duration > 0 ? ((p.totalMinionsKilled + p.neutralMinionsKilled) / (duration / 60)).toFixed(1) : '0.0'; }
