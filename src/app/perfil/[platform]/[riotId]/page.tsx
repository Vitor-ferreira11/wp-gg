import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProfileView } from '@/components/profile-view';
import { Notice } from '@/components/ui';
import { getProfile, RiotError } from '@/lib/riot';
import { isPlatform, parseRiotId, platforms, decodeRouteRiotId } from '@/lib/stats';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ProfilePage({ params }: { params: Promise<{ platform: string; riotId: string }> }) {
  const { platform, riotId: routeId } = await params;
  const riotId = decodeRouteRiotId(routeId);
  if (!isPlatform(platform)) notFound();
  try { parseRiotId(riotId); }
  catch { return <main id="conteudo"><Notice title="Riot ID inválido">Use o formato Nome#TAG.</Notice></main>; }
  let data;
  try { data = await getProfile(platform, riotId); }
  catch (error) {
    if (!(error instanceof RiotError)) throw error;
    return <main id="conteudo"><Notice title={error.status === 404 ? 'Não encontramos esse jogador' : error.status === 503 ? 'Conecte sua chave Riot' : 'Consulta indisponível'}><p>{error.message}</p><p className="mt-3">Busca: {riotId} · {platforms[platform].label}</p><Link href="/demo" className="demo-error-link">Explorar demonstração sem chave Riot →</Link></Notice></main>;
  }
  return <ProfileView data={data} platform={platform}/>;
}
