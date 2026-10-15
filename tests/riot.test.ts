import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getProfile, RiotError, dragon } from '../src/lib/riot';
const originalFetch = globalThis.fetch;
const originalKey = process.env.RIOT_API_KEY;
const originalDatabasePath = process.env.WP_DATABASE_PATH;
afterEach(() => { if (originalDatabasePath === undefined) delete process.env.WP_DATABASE_PATH; else process.env.WP_DATABASE_PATH = originalDatabasePath; });
afterEach(() => { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.RIOT_API_KEY; else process.env.RIOT_API_KEY = originalKey; });
test('sem chave falha antes de fazer qualquer chamada', async () => {
  delete process.env.RIOT_API_KEY;
  globalThis.fetch = async () => { throw new Error('Não deveria fazer chamada'); };
  await assert.rejects(getProfile('br1','GoBacck#br1'), (e: unknown) => e instanceof RiotError && e.status === 503);
});
test('usa hosts corretos, token só no cabeçalho e consulta 20 partidas', async () => {
  process.env.WP_DATABASE_PATH = ':memory:';
  process.env.RIOT_API_KEY = 'test-token';
  let detailCount = 0; let active = 0; let maxActive = 0;
  globalThis.fetch = async (input, options) => {
    const url = String(input);
    assert.ok(!url.includes('test-token'));
    if (url.includes('.api.riotgames.com')) assert.equal((options?.headers as Record<string,string>)['X-Riot-Token'],'test-token');
    if (url.includes('/accounts/')) { assert.ok(url.startsWith('https://americas.')); return Response.json({puuid:'player',gameName:'GoBacck',tagLine:'br1'}); }
    if (url.includes('/summoners/')) { assert.ok(url.startsWith('https://br1.')); return Response.json({profileIconId:1,summonerLevel:10}); }
    if (url.includes('/entries/')) { assert.ok(url.startsWith('https://br1.') && url.includes('/by-puuid/player')); return Response.json([]); }
    if (url.includes('/ids?')) { assert.ok(url.includes('count=20')); return Response.json(Array.from({length:20},(_,n)=>`BR1_${n}`)); }
    if (url.includes('versions.json')) return Response.json(['16.1.1']);
    if (url.includes('champion.json')) return Response.json({data:{}});
    assert.ok(url.startsWith('https://americas.') && url.includes('/matches/BR1_'));
    detailCount++; active++; maxActive = Math.max(maxActive,active);
    await new Promise(resolve => setTimeout(resolve,1)); active--;
    return Response.json({metadata:{matchId:url.split('/').at(-1)},info:{participants:[]}});
  };
  const profile = await getProfile('br1','GoBacck#br1');
  assert.equal(profile.rankHistory.unavailable, false);
  assert.equal(profile.rankHistory.snapshots.length, 2);
  assert.equal(profile.matches.length,20); assert.equal(detailCount,20); assert.equal(maxActive,3);
});
test('429 preserva Retry-After e não repete a chamada', async () => {
  process.env.RIOT_API_KEY = 'test-token'; let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('',{status:429,headers:{'Retry-After':'25'}}); };
  await assert.rejects(getProfile('br1','GoBacck#br1'), (e: unknown) => e instanceof RiotError && e.status === 429 && e.retryAfter === 25);
  assert.equal(calls,1);
});
test('404 de conta e 403 de chave têm mensagens úteis', async () => {
  process.env.RIOT_API_KEY = 'test-token';
  for (const status of [404,403]) {
    globalThis.fetch = async () => new Response('',{status});
    await assert.rejects(getProfile('br1','GoBacck#br1'), (e: unknown) => e instanceof RiotError && e.status === status && !e.message.includes('test-token'));
  }
});

test('falha de rede e indisponibilidade do Data Dragon têm erro controlado', async () => {
  process.env.RIOT_API_KEY = 'test-token';
  globalThis.fetch = async () => { throw new Error('network'); };
  await assert.rejects(getProfile('br1', 'GoBacck#br1'), (e: unknown) => e instanceof RiotError && e.status === 502);
  await assert.rejects(dragon('api/versions.json'), (e: unknown) => e instanceof RiotError && e.status === 502);
});

test('perfil sem classificação e sem partidas não inventa resultados', async () => {
  process.env.WP_DATABASE_PATH = ':memory:';
  process.env.RIOT_API_KEY = 'test-token';
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.includes('/accounts/')) return Response.json({ puuid: 'empty', gameName: 'Empty', tagLine: 'br1' });
    if (url.includes('/summoners/')) return Response.json({ profileIconId: 1, summonerLevel: 1 });
    if (url.includes('versions.json')) return Response.json(['16.1.1']);
    if (url.includes('champion.json')) return Response.json({ data: {} });
    return Response.json([]);
  };
  const profile = await getProfile('br1', 'Empty#br1');
  assert.deepEqual(profile.leagues, []);
  assert.deepEqual(profile.matches, []);
  assert.equal(profile.missingMatches, 0);
});

test('partida removida gera contagem explícita e outras falhas interrompem o perfil', async () => {
  process.env.WP_DATABASE_PATH = ':memory:';
  process.env.RIOT_API_KEY = 'test-token';
  let detailStatus = 404;
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.includes('/accounts/')) return Response.json({ puuid: 'partial', gameName: 'Partial', tagLine: 'br1' });
    if (url.includes('/summoners/')) return Response.json({ profileIconId: 1, summonerLevel: 1 });
    if (url.includes('/entries/')) return Response.json([]);
    if (url.includes('/ids?')) return Response.json(['BR1_missing']);
    if (url.includes('versions.json')) return Response.json(['16.1.1']);
    if (url.includes('champion.json')) return Response.json({ data: {} });
    return new Response('', { status: detailStatus });
  };
  const profile = await getProfile('br1', 'Partial#br1');
  assert.equal(profile.missingMatches, 1);
  assert.deepEqual(profile.matches, []);
  detailStatus = 500;
  await assert.rejects(getProfile('br1', 'Partial#br1'), (e: unknown) => e instanceof RiotError && e.status === 500);
});
