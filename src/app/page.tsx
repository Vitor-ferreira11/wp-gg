import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight, Activity, Layers3, Trophy, UserRound, Compass } from 'lucide-react';
import { SearchForm } from '@/components/search-form';
import { asset, dragon, getPlayerPreview } from '@/lib/riot';
import { demoOnly } from '@/lib/public-mode';
import { getDemoProfile } from '@/lib/demo-profile';

export default async function Home() {
  const publicDemo = demoOnly();
  const exampleHref = publicDemo ? '/demo' : '/perfil/br1/GoBacck%23br1';
  const exampleName = publicDemo ? 'WePlay Demo' : 'GoBacck';
  const exampleTag = publicDemo ? 'DEMO' : 'br1';
  const previewPromise = publicDemo ? Promise.resolve(getDemoProfile()) : getPlayerPreview('br1', 'GoBacck#br1').catch(() => null);
  let version: string | null = null;
  try { version = (await dragon<string[]>('api/versions.json'))[0] ?? null; } catch { /* A busca continua disponível sem as imagens. */ }
  const preview = await previewPromise;
  return <main id="conteudo" className="home-main home-expanded">
    <div className="home-grid">
      <aside className="panel home-side home-profile" aria-labelledby="home-profile-title">
        <div className="home-side-heading"><UserRound size={18}/><h2 id="home-profile-title">Conheça um perfil</h2></div>
        <p className="muted">Veja suas partidas por uma nova perspectiva.</p>
        <div className="home-player"><span className="player-monogram">{version && preview ? <Image src={asset(version, 'profileicon', preview.summoner.profileIconId)} alt={`Avatar de ${exampleName}`} width={42} height={42} className="home-player-avatar"/> : <UserRound size={22} aria-label="Avatar indisponível"/>}</span><div><strong>{exampleName}<span>#{exampleTag}</span></strong><small>{publicDemo ? 'Dados fictícios · Demonstração' : 'Brasil · Perfil de exemplo'}</small></div></div>
        <ul className="profile-preview-list"><li><Trophy size={17}/><div><strong>Classificação</strong><span>Elo e pontos de liga por fila.</span></div></li><li><Activity size={17}/><div><strong>Desempenho</strong><span>Vitórias e KDA recentes.</span></div></li><li><Layers3 size={17}/><div><strong>Histórico completo</strong><span>Partidas, times e itens.</span></div></li></ul>
        <Link prefetch={false} href={exampleHref} className="home-side-action">Explorar perfil <ArrowRight size={16}/></Link>
      </aside>

      <section className="hero home-hero" id="busca" aria-labelledby="home-search-title">
        <p className="eyebrow">LEAGUE OF LEGENDS</p>
        <div className="hero-wordmark" aria-hidden="true">WP<span>.GG</span></div>
        <h1 id="home-search-title">Seu desempenho, <span>com clareza.</span></h1>
        <p className="hero-copy">{publicDemo ? 'Explore o WP.GG com um perfil de demonstração.' : 'Encontre seu perfil e acompanhe sua jornada.'}</p>
        <SearchForm demoOnly={publicDemo}/>
        <div className="hero-hint"><span>Experimente</span><Link prefetch={false} href={exampleHref}>{exampleName}#{exampleTag} <ArrowUpRight size={14}/></Link><span className="hint-divider">·</span><span>Brasil</span></div>
        <p className="home-search-note">{publicDemo ? 'Demonstração pública, sem consultas a jogadores reais.' : 'Busque com seu Riot ID completo: nome + #tag.'}</p>
        <Link href="/demo" className="home-demo-link">Explorar demonstração sem chave Riot <ArrowUpRight size={14}/></Link>
      </section>

      <aside className="panel home-side home-champions" aria-labelledby="home-champions-title">
        <div className="home-side-heading"><Compass size={18}/><h2 id="home-champions-title">Explore os campeões</h2></div>
        <p className="muted">{publicDemo ? 'Catálogo, habilidades e imagens oficiais do jogo.' : 'Runas, habilidades e escolhas observadas nas partidas.'}</p>
        <div className="home-champion-list">{[
          {id:'Jinx',name:'Jinx',description:'O Gatilho Desenfreado'},
          {id:'Ahri',name:'Ahri',description:'A Raposa de Nove Caudas'},
          {id:'Leona',name:'Leona',description:'A Alvorada Radiante'},
        ].map(c => <Link href={`/campeoes/${c.id}`} key={c.id} className="home-champion-link">{version ? <Image src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.id}.png`} alt="" width={44} height={44}/> : <span className="champion-monogram">{c.name[0]}</span>}<div><strong>{c.name}</strong><small>{c.description}</small></div><ArrowUpRight size={15}/></Link>)}</div>
        <Link href="/campeoes" className="home-side-action">Todos os campeões <ArrowRight size={16}/></Link>
      </aside>
    </div>

    <section className="home-highlights" aria-label="O que você encontra no WP.GG">
      {[
        {Icon:Trophy,title:'Sua evolução',text:'Classificação atual e desempenho nas últimas partidas.',href:exampleHref,link:'Ver perfil de exemplo'},
        {Icon:Layers3,title:'Cada partida em detalhe',text:'Os dois times, KDA, dano, visão, farm e itens de cada jogador.',href:exampleHref,link:'Explorar partidas'},
        {Icon:Activity,title:'Escolhas em perspectiva',text:publicDemo ? 'Conheça os campeões e suas habilidades oficiais.' : 'Conheça os campeões e suas estatísticas na amostra local.',href:'/campeoes',link:'Explorar campeões'},
      ].map(({Icon,title,text,href,link}) => <article className="panel home-highlight" key={title}><Icon size={22} strokeWidth={1.5}/><div><h2>{title}</h2><p className="muted">{text}</p><Link href={href}>{link} <ArrowUpRight size={13}/></Link></div></article>)}
    </section>
  </main>;
}



