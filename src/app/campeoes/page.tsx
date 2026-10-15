import { dragon, RiotError } from '@/lib/riot';
import { readChampionSamples } from '@/lib/champion-samples';
import type { Champion } from '@/lib/types';
import { ChampionExplorer } from '@/components/champion-explorer';
import { Notice } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata = { title: 'Campeões' };
export default async function ChampionsPage() {
  try {
    const versions = await dragon<string[]>('api/versions.json');
    const { data } = await dragon<{ data: Record<string, Champion> }>(`cdn/${versions[0]}/data/pt_BR/champion.json`);
    const { samples, unavailable } = readChampionSamples();
    return <main id="conteudo" className="champions-main"><div className="champions-title"><div><p className="eyebrow">LEAGUE OF LEGENDS</p><h1>Campeões</h1><p className="muted">Encontre seu próximo campeão. Explore o desempenho nas partidas coletadas pelo WP.GG.</p></div><span className="catalog-patch">Catálogo {versions[0]}</span></div><ChampionExplorer champions={Object.values(data)} version={versions[0]} samples={samples} unavailable={unavailable}/></main>;
  } catch (error) { if (!(error instanceof RiotError)) throw error; return <main id="conteudo"><Notice title="Catálogo indisponível">{error.message}</Notice></main>; }
}

