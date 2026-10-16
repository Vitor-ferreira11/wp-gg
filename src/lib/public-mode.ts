import 'server-only';

export function demoOnly(env: Record<string, string | undefined> = process.env): boolean {
  // A publicação inicial na Vercel é exclusivamente demonstrativa.
  return env.WP_DEMO_ONLY === 'true' || env.VERCEL === '1';
}
