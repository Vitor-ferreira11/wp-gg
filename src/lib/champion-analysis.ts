import type { ChampionSample, SamplePlayer } from './champion-stats';
export type Usage<T> = { value: T; games: number; wins: number };
function groups<T>(players: SamplePlayer[], select: (p: SamplePlayer) => T | null, key: (value: T) => string): Usage<T>[] {
  const map = new Map<string, Usage<T>>();
  for (const p of players) {
    const value = select(p); if (value === null) continue;
    const id = key(value); const entry = map.get(id) ?? { value, games: 0, wins: 0 };
    entry.games++; entry.wins += Number(p.win); map.set(id, entry);
  }
  return [...map.values()].sort((a,b) => b.games - a.games || b.wins - a.wins);
}
export function analyzeChampion(samples: ChampionSample[], championId: number, position: string) {
  const observations = samples.flatMap(match => match.players.filter(p => p.championId === championId && (position === 'ALL' || p.position === position)).map(player => ({ player, match })));
  const players = observations.map(x => x.player);
  const withRunes = players.filter(p => p.runes);
  const withSpells = players.filter(p => p.spells?.length === 2);
  const withItems = players.filter(p => p.items?.some(id => id > 0));
  const items = new Map<number, Usage<number>>();
  for (const p of withItems) for (const id of new Set(p.items!.filter(id => id > 0))) {
    const value = items.get(id) ?? { value: id, games: 0, wins: 0 }; value.games++; value.wins += Number(p.win); items.set(id, value);
  }
  const opponents = new Map<number, Usage<number>>();
  const partners = new Map<number, Usage<number>>();
  let laneGames = 0; let duoGames = 0;
  for (const {player,match} of observations) {
    if (player.teamId === undefined) continue;
    const add = (map: Map<number,Usage<number>>, id: number) => { const row = map.get(id) ?? {value:id,games:0,wins:0}; row.games++; row.wins += Number(player.win); map.set(id,row); };
    const opponent = player.position ? match.players.find(p => p.teamId !== undefined && p.teamId !== player.teamId && p.position === player.position) : undefined;
    if (opponent) { add(opponents, opponent.championId); laneGames++; }
    const partnerRole = player.position === 'BOTTOM' ? 'UTILITY' : player.position === 'UTILITY' ? 'BOTTOM' : null;
    const partner = partnerRole ? match.players.find(p => p.teamId === player.teamId && p.position === partnerRole) : undefined;
    if (partner) { add(partners,partner.championId); duoGames++; }
  }
  const order = (map: Map<number,Usage<number>>) => [...map.values()].sort((a,b) => b.games-a.games).slice(0,5);
  return { games: players.length, wins: players.filter(p=>p.win).length, runeGames: withRunes.length, spellGames: withSpells.length, itemGames: withItems.length,
    runes: groups(withRunes,p=>p.runes ?? null,JSON.stringify).slice(0,3),
    spells: groups(withSpells,p=>[...p.spells!].sort((a,b)=>a-b),JSON.stringify).slice(0,3),
    builds: groups(withItems,p=>p.items!.filter(id=>id>0).sort((a,b)=>a-b),JSON.stringify).slice(0,4),
    items: order(items).slice(0,5), opponents: order(opponents), partners: order(partners), laneGames, duoGames };
}
export type AnalysisAssets = { items: Record<string,{name:string;image:{full:string}}>;
  spells: Record<string,{key:string;name:string;image:{full:string}}>;
  runes: {id:number;name:string;icon:string;slots:{runes:{id:number;name:string;icon:string;shortDesc:string}[]}[]}[] };
