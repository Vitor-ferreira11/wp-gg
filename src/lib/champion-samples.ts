import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import type { Match } from './types';
import type { ChampionSample } from './champion-stats';

function database() {
  const path = process.env.WP_DATABASE_PATH || resolve(process.cwd(), '.data/wp-gg.sqlite');
  mkdirSync(dirname(resolve(/* turbopackIgnore: true */ path)), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS champion_samples (matchId TEXT PRIMARY KEY, data TEXT NOT NULL);`);
  return db;
}
export function captureChampionSamples(matches: Match[]) {
  let db: DatabaseSync | undefined;
  try {
    db = database();
    const write = db.prepare('INSERT INTO champion_samples (matchId, data) VALUES (?, ?) ON CONFLICT(matchId) DO UPDATE SET data = excluded.data');
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const match of matches) {
        if (![420, 440].includes(match.info.queueId) || match.info.participants.length !== 10) continue;
        const sample: ChampionSample = { id: match.metadata.matchId, platform: match.metadata.matchId.split('_')[0].toLowerCase(), patch: match.info.gameVersion?.split('.').slice(0, 2).join('.') || 'Desconhecido', queue: match.info.queueId, players: match.info.participants.map(p => ({ championId: p.championId, position: p.teamPosition, win: p.win, teamId: p.teamId, items: [p.item0,p.item1,p.item2,p.item3,p.item4,p.item5], spells: p.summoner1Id && p.summoner2Id ? [p.summoner1Id,p.summoner2Id] : undefined, runes: p.perks?.styles?.length === 2 ? { primary: p.perks.styles[0].style, secondary: p.perks.styles[1].style, selections: p.perks.styles.flatMap(s => s.selections.map(x => x.perk)), shards: [p.perks.statPerks.offense,p.perks.statPerks.flex,p.perks.statPerks.defense] } : undefined })), bans: match.info.teams?.flatMap(t => t.bans.map(b => b.championId)) ?? [] };
        write.run(sample.id, JSON.stringify(sample));
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  } catch { /* A coleta não impede a consulta do perfil. */ }
  finally { db?.close(); }
}
export function readChampionSamples(): { samples: ChampionSample[]; unavailable: boolean } {
  let db: DatabaseSync | undefined;
  try {
    db = database();
    const rows = db.prepare('SELECT data FROM champion_samples ORDER BY matchId LIMIT 10000').all();
    return { samples: rows.map(row => JSON.parse(String(row.data)) as ChampionSample), unavailable: false };
  } catch { return { samples: [], unavailable: true }; }
  finally { db?.close(); }
}
