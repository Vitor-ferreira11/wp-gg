import type { Metadata } from 'next';
import { Header, Footer } from '@/components/ui';
import './globals.css';
import './home-layout.css';
export const metadata: Metadata = { title: { default: 'WP.GG — Seu desempenho, com clareza', template: '%s | WP.GG' }, description: 'Well Played: elo, desempenho e histórico de League of Legends em uma visão simples do seu jogo.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body><a href="#conteudo" className="skip-link">Ir para o conteúdo</a><Header/><div className="site-shell">{children}</div><Footer/></body></html>; }


