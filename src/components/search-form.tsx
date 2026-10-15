'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { platforms, parseRiotId, profileHref } from '@/lib/stats';
export function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [id, setId] = useState('');
  const [platform, setPlatform] = useState('br1');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  return <form className={compact ? 'search compact' : 'search'} onSubmit={e => { e.preventDefault(); try { const parsed = parseRiotId(id); setError(''); startTransition(() => router.push(profileHref(platform, `${parsed.gameName}#${parsed.tagLine}`))); } catch (err) { setError((err as Error).message); } }}>
    <div className="search-controls"><label className="region-label"><span className="sr-only">Servidor</span><select aria-label="Servidor" value={platform} onChange={e => setPlatform(e.target.value)}>{Object.entries(platforms).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label><Search size={20} className="search-icon"/><label className="flex-1 min-w-0"><span className="sr-only">Riot ID</span><input aria-describedby={error ? 'search-error' : undefined} aria-invalid={!!error} required placeholder="Seu nome#TAG" value={id} onChange={e => { setId(e.target.value); }} maxLength={49}/></label><button disabled={pending} type="submit" className="button">{pending ? 'Buscando…' : <><span>Buscar jogador</span><ArrowRight size={18}/></>}</button></div>
    {error && <p id="search-error" role="alert" className="text-red-300 mt-3">{error}</p>}
  </form>;
}

