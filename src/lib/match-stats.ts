import type { Participant } from './types';

export const positionLabel = (position: string) => ({ TOP: 'Topo', JUNGLE: 'Selva', MIDDLE: 'Meio', BOTTOM: 'Atirador', UTILITY: 'Suporte' }[position] ?? '—');

export function matchTeams(participants: Participant[]) {
  const groups = new Map<number, Participant[]>();
  for (const player of participants) {
    const id = player.teamId ?? 0;
    groups.set(id, [...(groups.get(id) ?? []), player]);
  }
  const order = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
  const positionOrder = (p: Participant) => { const index = order.indexOf(p.teamPosition); return index < 0 ? 5 : index; };
  return [...groups.entries()].sort(([a], [b]) => a - b).map(([id, players]) => ({
    id,
    players: [...players].sort((a, b) => positionOrder(a) - positionOrder(b)),
    kills: players.reduce((sum, p) => sum + p.kills, 0),
    gold: players.every(p => p.goldEarned !== undefined) ? players.reduce((sum, p) => sum + (p.goldEarned ?? 0), 0) : null,
    win: id === 0 ? null : players[0].win,
  }));
}

export function killParticipation(player: Participant, teamKills: number) {
  return teamKills > 0 ? Math.round((player.kills + player.assists) / teamKills * 100) : 0;
}
