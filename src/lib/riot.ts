import 'server-only';
import { demoOnly } from './public-mode';
import { captureRankHistory } from './rank-history';
import { captureChampionSamples } from './champion-samples';
import { platforms, type Platform, parseRiotId } from './stats';
import type { Account, Champion, League, Match, Profile, Summoner } from './types';

export class RiotError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number) { super(message); }
}
async function riot<T>(host: string, path: string, ttl = 120): Promise<T> {
  if (demoOnly()) throw new RiotError(503, 'Esta versão pública utiliza somente dados fictícios. Explore o perfil de demonstração.');
  const key = process.env.RIOT_API_KEY;
  if (!key) throw new RiotError(503, 'Configure RIOT_API_KEY no arquivo .env.local e reinicie o servidor para consultar dados reais.');
  let response: Response;
  try { response = await fetch(`https://${host}.api.riotgames.com${path}`, { headers: { 'X-Riot-Token': key }, next: { revalidate: ttl }, signal: AbortSignal.timeout(12000) }); }
  catch { throw new RiotError(502, 'A Riot não respondeu a tempo. Tente novamente em alguns instantes.'); }
  if (!response.ok) {
    const seconds = Number(response.headers.get('Retry-After') ?? 60);
    const message = response.status === 404 ? 'Jogador não encontrado nesta região. Confira o Riot ID e o servidor selecionado.' : response.status === 403 || response.status === 401 ? 'A chave Riot está inválida ou expirou. Atualize RIOT_API_KEY no servidor.' : response.status === 429 ? `Limite da Riot atingido. Aguarde ${seconds} segundos e tente novamente.` : 'A Riot está temporariamente indisponível. Tente novamente mais tarde.';
    throw new RiotError(response.status, message, response.status === 429 ? seconds : undefined);
  }
  return response.json() as Promise<T>;
}
export async function dragon<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`https://ddragon.leagueoflegends.com/${path}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error();
    return await res.json() as T;
  } catch { throw new RiotError(502, 'Não foi possível carregar os recursos do Data Dragon. Tente novamente.'); }
}
export async function getPlayerPreview(platform: Platform, id: string) {
  const { gameName, tagLine } = parseRiotId(id);
  const account = await riot<Account>(platforms[platform].region, `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
  const summoner = await riot<Summoner>(platform, `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(account.puuid)}`);
  return { account, summoner };
}
export async function getProfile(platform: Platform, id: string): Promise<Profile> {
  const { gameName, tagLine } = parseRiotId(id);
  const regional = platforms[platform].region;
  const account = await riot<Account>(regional, `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
  const puuid = encodeURIComponent(account.puuid);
  const [summoner, leagues, ids, versions] = await Promise.all([
    riot<Summoner>(platform, `/lol/summoner/v4/summoners/by-puuid/${puuid}`),
    riot<League[]>(platform, `/lol/league/v4/entries/by-puuid/${puuid}`),
    riot<string[]>(regional, `/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`),
    dragon<string[]>('api/versions.json'),
  ]);
  const version = versions[0];
  const { data: champions } = await dragon<{ data: Record<string, Champion> }>(`cdn/${version}/data/pt_BR/champion.json`);
  // Pequenos lotes evitam uma rajada de vinte chamadas simultâneas.
  const matches: Match[] = [];
  let missingMatches = 0;
  for (let start = 0; start < ids.length; start += 3) {
    const batch = await Promise.allSettled(ids.slice(start, start + 3).map(matchId => riot<Match>(regional, `/lol/match/v5/matches/${encodeURIComponent(matchId)}`, 3600)));
    for (const result of batch) {
      if (result.status === 'fulfilled') matches.push(result.value);
      else if (result.reason instanceof RiotError && result.reason.status === 404) missingMatches++;
      else throw result.reason;
    }
  }
  const rankHistory = captureRankHistory(account.puuid, platform, leagues);
  captureChampionSamples(matches);
  return { account, summoner, leagues, matches, version, champions, missingMatches, rankHistory };
}
export const asset = (version: string, kind: 'champion' | 'profileicon' | 'item', file: string | number) => `https://ddragon.leagueoflegends.com/cdn/${version}/img/${kind}/${file}.png`;
