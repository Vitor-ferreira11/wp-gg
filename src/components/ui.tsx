import Link from 'next/link';
import { SiteNav } from './site-nav';

export function Header() {
  return <header className="header site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="WP.GG — Well Played, início"><span className="wordmark">WP<span>.GG</span></span><span className="brand-name">Well Played</span></Link>
    <span className="header-game">League of Legends</span><span className="header-tagline">Seu jogo, com clareza.</span>
  </div><SiteNav/></header>;
}
export function Footer() {
  return <footer className="footer site-footer"><div className="footer-inner"><div><span className="footer-brand">WP<span>.GG</span></span><p>Well Played · Bem jogado.</p></div><p>WP.GG is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p></div></footer>;
}
export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="stat-card"><p className="stat-label">{label}</p><strong>{value}</strong><p className="muted">{detail}</p></div>;
}
export function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="panel notice" role="status"><p className="eyebrow">WP.GG</p><h2>{title}</h2><div className="muted">{children}</div><Link href="/" className="button mt-6 inline-flex">Voltar à busca</Link></div>;
}


