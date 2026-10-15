import type { Champion, Match, Participant, Profile } from './types';

// Dados determinísticos de apresentação, sem identificadores de jogadores reais.
const catalog: [string, number, string][] = [
  ['Jinx', 222, 'Jinx'], ['Leona', 89, 'Leona'], ['Ezreal', 81, 'Ezreal'],
  ['Janna', 40, 'Janna'], ['Jax', 24, 'Jax'], ['JarvanIV', 59, 'Jarvan IV'],
  ['Ahri', 103, 'Ahri'], ['Kaisa', 145, "Kai'Sa"], ['Malphite', 54, 'Malphite'],
  ['LeeSin', 64, 'Lee Sin'], ['Zed', 238, 'Zed'], ['Ashe', 22, 'Ashe'],
  ['Thresh', 412, 'Thresh'], ['Diana', 131, 'Diana'], ['Lux', 99, 'Lux'],
];
const champions: Record<string, Champion> = Object.fromEntries(catalog.map(([id, key, name]) => [id, { id, key: String(key), name, image: { full: `${id}.png` } }]));

function participant(champion: Champion, puuid: string, teamId: number, teamPosition: string, win: boolean, index: number, support = false): Participant {
  return {
    puuid, championId: Number(champion.key), championName: champion.id, teamId, teamPosition, win,
    champLevel: 14 + index % 4, goldEarned: support ? 8500 + index * 100 : 12000 + index * 200,
    kills: support ? 1 + index % 3 : 4 + index % 7, deaths: 2 + index % 5, assists: support ? 12 + index % 9 : 4 + index % 8,
    totalMinionsKilled: support ? 22 : 180 + index % 60, neutralMinionsKilled: teamPosition === 'JUNGLE' ? 120 : 0,
    totalDamageDealtToChampions: support ? 6500 + index * 100 : 18000 + index * 300, visionScore: support ? 45 + index : 15 + index,
    item0: support ? 3109 : 3031, item1: support ? 3190 : 3085, item2: 3047, item3: 3075, item4: 0, item5: 0, item6: 3364,
  };
}

export function getDemoProfile(): Profile {
  const puuid = 'demo-player';
  const ownChampions = ['Jinx', 'Jinx', 'Leona', 'Jinx', 'Ezreal', 'Janna', 'Jinx', 'Leona', 'Ezreal', 'Jinx'];
  const matches: Match[] = Array.from({ length: 20 }, (_, index) => {
    const queueId = [440, 420, 450, 440, 420][index % 5];
    const win = index % 5 < 3;
    const own = ownChampions[index % ownChampions.length];
    const support = ['Leona', 'Janna'].includes(own);
    const allies = ['Jax', 'JarvanIV', 'Ahri', support ? 'Kaisa' : 'Leona'];
    const enemies = ['Malphite', 'LeeSin', index % 2 ? 'Diana' : 'Zed', 'Ashe', 'Thresh'];
    const positions = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
    const participants = [
      participant(champions[own], puuid, 100, queueId === 450 ? '' : support ? 'UTILITY' : 'BOTTOM', win, index, support),
      ...allies.map((id, slot) => participant(champions[id], `demo-ally-${slot}`, 100, queueId === 450 ? '' : slot === 3 ? support ? 'BOTTOM' : 'UTILITY' : positions[slot], win, index + slot, !support && slot === 3)),
      ...enemies.map((id, slot) => participant(champions[id], `demo-enemy-${slot}`, 200, queueId === 450 ? '' : positions[slot], !win, index + slot, slot === 4)),
    ];
    return { metadata: { matchId: `DEMO_${20 - index}` }, info: { gameVersion: '16.1.1', queueId, gameDuration: 1500 + index * 15, gameEndTimestamp: Date.UTC(2026, 9, 13, 21) - index * 3600000, participants } };
  });
  return {
    account: { puuid, gameName: 'WePlay Demo', tagLine: 'DEMO' }, summoner: { profileIconId: 29, summonerLevel: 234 },
    leagues: [{ queueType: 'RANKED_SOLO_5x5', tier: 'GOLD', rank: 'II', leaguePoints: 42, wins: 30, losses: 20 }, { queueType: 'RANKED_FLEX_SR', tier: 'PLATINUM', rank: 'I', leaguePoints: 71, wins: 19, losses: 19 }],
    version: '16.1.1', champions, matches, missingMatches: 0, rankHistory: { snapshots: [], unavailable: false },
  };
}
