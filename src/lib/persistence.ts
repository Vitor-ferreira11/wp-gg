import 'server-only';
import { demoOnly } from './public-mode';

export function persistenceEnabled(env: Record<string, string | undefined> = process.env): boolean {
  // Vercel não oferece persistência para o arquivo SQLite local.
  if (demoOnly(env)) return false;
  return env.WP_PERSISTENCE !== 'disabled';
}
