export type SamplePlayer = { championId: number; position: string; win: boolean; teamId?: number; items?: number[]; spells?: number[]; runes?: { primary: number; secondary: number; selections: number[]; shards: number[] } };
export type ChampionSample = { id: string; platform: string; patch: string; queue: number; players: SamplePlayer[]; bans: number[] };
export type ChampionMetrics = { id: number; games: number; wins: number; bans: number; winRate: number | null; pickRate: number | null; banRate: number | null };
export function championMetrics(samples: ChampionSample[], position: string) {
  const result = new Map<number, ChampionMetrics>();
  const entry = (id: number) => { let value = result.get(id); if (!value) { value = { id, games: 0, wins: 0, bans: 0, winRate: null, pickRate: null, banRate: null }; result.set(id, value); } return value; };
  for (const match of samples) {
    for (const player of match.players) {
      if (position !== 'ALL' && player.position !== position) continue;
      const metric = entry(player.championId); metric.games++; metric.wins += Number(player.win);
    }
    for (const id of new Set(match.bans.filter(id => id > 0))) entry(id).bans++;
  }
  for (const metric of result.values()) {
    metric.winRate = metric.games ? metric.wins / metric.games * 100 : null;
    metric.pickRate = samples.length ? metric.games / samples.length * 100 : null;
    metric.banRate = samples.length ? metric.bans / samples.length * 100 : null;
  }
  return result;
}
export const cleanText = (text: string) => text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
export const championClass = (tag: string) => ({ Fighter: 'Lutador', Tank: 'Tanque', Mage: 'Mago', Assassin: 'Assassino', Support: 'Suporte', Marksman: 'Atirador' }[tag] ?? tag);
