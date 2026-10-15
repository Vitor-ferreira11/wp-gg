import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SearchForm } from '@/components/search-form';
import { StatCard } from '@/components/ui';
import { WinRateChart } from '@/components/win-rate-chart';
import { MatchCard } from '@/components/match-card';
import { MatchHistory } from '@/components/match-history';
import { RankEmblem } from '@/components/rank-emblem';
import { ChampionRelations } from '@/components/champion-relations';
import { asset } from '@/lib/riot';
import { aggregate, platforms, type Platform } from '@/lib/stats';
import type { Profile } from '@/lib/types';

export function ProfileView({ data, platform, demo = false }: { data: Profile; platform: Platform; demo?: boolean }) {
  const stats = aggregate(data.matches, data.account.puuid);
  const favorite = Object.values(data.champions).find(champion => Number(champion.key) === stats.champions[0]?.id);
  return <main id="conteudo" className="profile-main">
    {demo && <aside className="demo-banner" aria-label="Modo de demonstração"><div><strong>Modo de demonstração</strong><p>Perfil e partidas fictícios para explorar o WP.GG. Estes resultados não pertencem a um jogador real.</p></div><Link href="/">Buscar jogador real →</Link></aside>}
    <div className="profile-search"><Link className="back-link" href="/"><ArrowLeft size={17}/> Nova busca</Link><SearchForm compact/></div>
    <section className="profile-header" aria-label="Jogador">
      <Image className="avatar" src={asset(data.version,'profileicon',data.summoner.profileIconId)} alt="Ícone do jogador" width={80} height={80}/>
      <div><p className="eyebrow">{platforms[platform].label} · Nível {data.summoner.summonerLevel}</p><h1>{data.account.gameName}<span>#{data.account.tagLine}</span></h1></div>
      <span className="live-label"><span className="status-dot"/> {demo ? 'Dados fictícios · Demonstração' : 'Dados da Riot Games'}</span>
    </section>
    <div className="overview-grid profile-overview">
      <section className="panel ranked" aria-labelledby="rank-title">
        <h2 className="section-label" id="rank-title">Classificação</h2>
        {['RANKED_SOLO_5x5','RANKED_FLEX_SR'].map(queue => {
          const league = data.leagues.find(l => l.queueType === queue);
          return <div className="rank-row" key={queue}><RankEmblem tier={league?.tier}/><div><small>{queue === 'RANKED_SOLO_5x5' ? 'Solo / Duo' : 'Flex'}</small><h3>{league ? `${league.tier} ${league.rank}` : 'Sem classificação'}</h3>{league && <p className="muted">{league.leaguePoints} LP <span className="rank-record">· {league.wins}V / {league.losses}D</span></p>}</div>{league && <span className="rank-rate">{Math.round(league.wins/(league.wins+league.losses || 1)*100)}%<small>vitórias</small></span>}</div>;
        })}
      </section>
      <section className="panel performance" aria-labelledby="performance-title">
        <div className="performance-heading"><h2 className="section-label" id="performance-title">Desempenho recente</h2><span>Últimas {stats.games} partidas · Todas as filas</span></div>
        <div className="performance-body"><div className="performance-metrics"><div className="stats-grid"><StatCard label="Taxa de vitória" value={`${stats.winRate}%`} detail={`${stats.wins} vitórias · ${stats.losses} derrotas`}/><StatCard label="KDA" value={stats.kda} detail={`${stats.kills} / ${stats.deaths} / ${stats.assists}`}/><StatCard label="Partidas" value={String(stats.games)} detail="Histórico disponível"/></div>
        <div className="result-strip" aria-label={`${stats.wins} vitórias e ${stats.losses} derrotas`}>
          {data.matches.map(match => { const p = match.info.participants.find(player => player.puuid === data.account.puuid); return p ? <span key={match.metadata.matchId} className={p.win ? 'result-win' : 'result-loss'} title={p.win ? 'Vitória' : 'Derrota'}>{p.win ? 'V' : 'D'}</span> : null; })}
          {!stats.games && <p className="muted">Nenhuma partida recente.</p>}
        </div>
        </div><WinRateChart wins={stats.wins} losses={stats.losses}/></div>
      </section>
      <section className="panel favorite-champion" aria-label="Campeão mais jogado">{favorite ? <><Image src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${favorite.id}_0.jpg`} alt={favorite.name} fill sizes="(max-width: 760px) 100vw, 300px"/><div><span>Campeão mais jogado</span><strong>{favorite.name}</strong><small>{stats.champions[0].games} partidas no histórico recente</small></div></> : <p className="muted">Nenhum campeão no histórico recente.</p>}</section>
    </div>
    <div className="profile-columns">
    <section className="panel profile-champions" aria-labelledby="most-played-title">
      <h2 id="most-played-title">Campeões mais jogados</h2><p className="muted">No histórico recente</p>
      <div className="champions-grid">
        {!stats.champions.length && <p className="muted">Nenhuma partida disponível.</p>}
        {stats.champions.map(c => { const champ = Object.values(data.champions).find(x => Number(x.key) === c.id); return <div className="champion-row" key={c.id}>{champ && <Image src={asset(data.version,'champion',champ.id)} alt={champ.name} width={40} height={40}/>}<div><strong>{champ?.name ?? c.name}</strong><small>{c.games} partidas</small></div><strong className="champion-rate">{Math.round(c.wins/c.games*100)}%<small>vitórias</small></strong></div>; })}
      </div>
    </section>
    <MatchHistory demo={demo} missingMatches={data.missingMatches} entries={data.matches.filter(match => match.info.participants.some(player => player.puuid === data.account.puuid)).map(match => ({ id: match.metadata.matchId, queueId: match.info.queueId, card: <MatchCard match={match} puuid={data.account.puuid} version={data.version} champions={data.champions}/> }))}/>
    <ChampionRelations matches={data.matches} puuid={data.account.puuid} champions={data.champions} version={data.version}/>
    </div>
  </main>;
}





