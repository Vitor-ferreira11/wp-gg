import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { League } from './types';

export type RankSnapshot = { day: string; observedAt: string; queueType: string; tier: string | null; rank: string | null; leaguePoints: number | null; wins: number | null; losses: number | null };
export type RankHistory = { snapshots: RankSnapshot[]; unavailable: boolean };
const queues = ['RANKED_SOLO_5x5', 'RANKED_FLEX_SR'];
export function historyDay(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function recordRankHistory(puuid: string, platform: string, leagues: League[], now = new Date(), path = process.env.WP_DATABASE_PATH || resolve(process.cwd(), '.data/wp-gg.sqlite')): RankSnapshot[] {
  // Arquivo criado em runtime; não deve integrar o pacote de publicação.
  mkdirSync(dirname(resolve(/* turbopackIgnore: true */ path)), { recursive: true });
  const db = new DatabaseSync(path);
  try {
    db.exec(`PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS rank_snapshots (
        puuid TEXT NOT NULL, platform TEXT NOT NULL, queueType TEXT NOT NULL,
        day TEXT NOT NULL, observedAt TEXT NOT NULL,
        tier TEXT, rank TEXT, leaguePoints INTEGER, wins INTEGER, losses INTEGER,
        PRIMARY KEY (puuid, platform, queueType, day)
      );`);
    const day = historyDay(now);
    const observedAt = now.toISOString();
    const write = db.prepare(`INSERT INTO rank_snapshots
      (puuid, platform, queueType, day, observedAt, tier, rank, leaguePoints, wins, losses)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (puuid, platform, queueType, day) DO UPDATE SET
        observedAt = excluded.observedAt, tier = excluded.tier, rank = excluded.rank,
        leaguePoints = excluded.leaguePoints, wins = excluded.wins, losses = excluded.losses
      WHERE excluded.observedAt >= rank_snapshots.observedAt`);
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const queue of queues) {
        const league = leagues.find(l => l.queueType === queue);
        write.run(puuid, platform, queue, day, observedAt, league?.tier ?? null, league?.rank ?? null, league?.leaguePoints ?? null, league?.wins ?? null, league?.losses ?? null);
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    return db.prepare(`SELECT day, observedAt, queueType, tier, rank, leaguePoints, wins, losses
      FROM rank_snapshots WHERE puuid = ? AND platform = ?
      ORDER BY day DESC, queueType ASC LIMIT 240`).all(puuid, platform) as RankSnapshot[];
  } finally { db.close(); }
}
export function captureRankHistory(puuid: string, platform: string, leagues: League[]): RankHistory {
  try { return { snapshots: recordRankHistory(puuid, platform, leagues), unavailable: false }; }
  catch { return { snapshots: [], unavailable: true }; }
}
