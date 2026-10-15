import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dragon, RiotError } from '@/lib/riot';
import { championClass, cleanText } from '@/lib/champion-stats';
import type { Champion } from '@/lib/types';
import { Notice } from '@/components/ui';
import { ChampionAnalysis } from '@/components/champion-analysis';
import { readChampionSamples } from '@/lib/champion-samples';
import type { AnalysisAssets } from '@/lib/champion-analysis';

type Detail = Champion & { lore: string; skins: { id: string; name: string; num: number }[]; passive: { name: string; description: string; image: { full: string } }; spells: { id: string; name: string; description: string; image: { full: string }; cooldownBurn: string; costBurn: string }[]; stats: { hp: number; armor: number; spellblock: number; attackdamage: number; attackrange: number; movespeed: number } };
export default async function ChampionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(id)) notFound();
  let version: string;
  let champion: Detail;
  let champions: Champion[] = [];
  try {
    version = (await dragon<string[]>('api/versions.json'))[0];
    const catalog = await dragon<{ data: Record<string, Champion> }>(`cdn/${version}/data/pt_BR/champion.json`);
    champions = Object.values(catalog.data);
    if (!Object.hasOwn(catalog.data, id)) notFound();
    champion = (await dragon<{ data: Record<string, Detail> }>(`cdn/${version}/data/pt_BR/champion/${id}.json`)).data[id];
  } catch (error) { if (!(error instanceof RiotError)) throw error; return <main id="conteudo"><Notice title="Campeão indisponível">{error.message}</Notice></main>; }
  const abilities = [{ key: 'P', ...champion.passive, kind: 'passive' }, ...champion.spells.map((spell,i) => ({ key: ['Q','W','E','R'][i], ...spell, kind: 'spell' }))];
  const { samples, unavailable } = readChampionSamples();
  let assets: AnalysisAssets | null = null;
  try {
    const [items, spells, runes] = await Promise.all([
      dragon<{ data: AnalysisAssets['items'] }>(`cdn/${version}/data/pt_BR/item.json`),
      dragon<{ data: AnalysisAssets['spells'] }>(`cdn/${version}/data/pt_BR/summoner.json`),
      dragon<AnalysisAssets['runes']>(`cdn/${version}/data/pt_BR/runesReforged.json`),
    ]);
    assets = { items: items.data, spells: spells.data, runes };
  } catch { /* O catálogo principal continua disponível. */ }
  return <main id="conteudo" className="champions-main"><Link href="/campeoes" className="back-link">← Todos os campeões</Link><section className="champion-detail-header"><Image src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`} alt={champion.name} width={96} height={96}/><div><p className="eyebrow">{champion.tags?.map(championClass).join(' · ')}</p><h1>{champion.name}</h1><p className="muted">{champion.title}</p></div><span className="catalog-patch">Catálogo {version}</span></section><p className="champion-lore muted">{cleanText(champion.lore)}</p><ChampionAnalysis samples={samples.filter(s => s.players.some(p => p.championId === Number(champion.key)))} championId={Number(champion.key)} champions={champions} version={version} assets={assets} unavailable={unavailable}/><section className="panel champion-base"><h2>Atributos base</h2><p className="muted">Valores do catálogo para o nível inicial, sem itens.</p><dl>{[['Vida',champion.stats.hp],['Dano de ataque',champion.stats.attackdamage],['Armadura',champion.stats.armor],['Resistência mágica',champion.stats.spellblock],['Alcance',champion.stats.attackrange],['Movimento',champion.stats.movespeed]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section><section className="champion-abilities"><h2>Habilidades</h2><div>{abilities.map(ability => <article key={ability.key} className="panel ability"><div className="ability-title"><Image src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/${ability.kind}/${ability.image.full}`} alt="" width={44} height={44}/><div><span>{ability.key === 'P' ? 'Passiva' : ability.key}</span><h3>{ability.name}</h3></div></div><p className="muted">{cleanText(ability.description)}</p></article>)}</div></section><details className="skins-disclosure"><summary>Skins de {champion.name}</summary><p className="muted">Catálogo oficial; não é um ranking de popularidade.</p><div className="skin-gallery">{champion.skins.map(skin => <figure key={skin.id}><Image src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`} alt={skin.name === 'default' ? `${champion.name} clássica` : skin.name} width={320} height={180} sizes="(max-width: 760px) 100vw, 33vw"/><figcaption>{skin.name === 'default' ? `${champion.name} clássica` : skin.name}</figcaption></figure>)}</div></details></main>;
}


