'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, LayoutGrid, UserRound } from 'lucide-react';

export function SiteNav() {
  const pathname = usePathname();
  const links = [
    { href: '/', label: 'Início', Icon: House, active: pathname === '/' },
    { href: '/campeoes', label: 'Campeões', Icon: LayoutGrid, active: pathname.startsWith('/campeoes') },
    { href: '/perfil/br1/GoBacck%23br1', label: 'Perfil de exemplo', Icon: UserRound, active: pathname.startsWith('/perfil') },
    { href: '/demo', label: 'Demonstração', Icon: UserRound, active: pathname === '/demo' },
  ];
  return <nav className="site-navigation" aria-label="Navegação principal"><div className="navigation-inner">{links.map(({href,label,Icon,active}) => <Link key={href} href={href} aria-current={active ? 'page' : undefined}><Icon size={16} strokeWidth={1.7}/>{label}</Link>)}</div></nav>;
}
