import type { Match } from './types';

export type ChampionRelation = { id: number; name: string; games: number; wins: number; losses: number };

export function championRelations(matches: Match[], puuid: string) {
  const allies = new Map<number, ChampionRelation>();
  const enemies = new Map<number, ChampionRelation>();
  const seen = new Set<string>();
  let games = 0;
  for (const match of matches) {
    if (seen.has(match.metadata.matchId)) continue;
    seen.add(match.metadata.matchId);
    const player = match.info.participants.find(p => p.puuid === puuid);
    if (!player || player.teamId == null || match.info.gameDuration < 300) continue;
    games++;
    const counted = { allies: new Set<number>(), enemies: new Set<number>() };
    for (const participant of match.info.participants) {
      if (participant.puuid === puuid || participant.teamId == null || participant.championId <= 0) continue;
      const side = participant.teamId === player.teamId ? 'allies' : 'enemies';
      if (counted[side].has(participant.championId)) continue;
      counted[side].add(participant.championId);
      const map = side === 'allies' ? allies : enemies;
      const row = map.get(participant.championId) ?? { id: participant.championId, name: participant.championName, games: 0, wins: 0, losses: 0 };
      row.games++;
      row.wins += Number(player.win);
      row.losses += Number(!player.win);
      map.set(row.id, row);
    }
  }
  const rank = (rows: Map<number, ChampionRelation>, result: 'wins' | 'losses') => [...rows.values()]
    .filter(row => row.games >= 2 && row[result] > 0)
    .sort((a, b) => b[result] - a[result] || b[result] / b.games - a[result] / a.games || b.games - a.games || a.id - b.id)
    .slice(0, 5);
  return { games, allies: rank(allies, 'wins'), enemies: rank(enemies, 'losses') };
}
