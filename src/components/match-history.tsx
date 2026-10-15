'use client';

import { useState, type ReactNode } from 'react';
import { queueLabel } from '@/lib/stats';

export function MatchHistory({ entries, missingMatches, demo = false }: { entries: { id: string; queueId: number; card: ReactNode }[]; missingMatches: number; demo?: boolean }) {
  const [queue, setQueue] = useState('all');
  const queues = [...new Set([420, 440, 450, ...entries.map(entry => entry.queueId)])];
  const filtered = entries.filter(entry => queue === 'all' || entry.queueId === Number(queue));
  return <section className="history" aria-labelledby="history-title">
    <div className="section-heading profile-column-heading"><div><h2 id="history-title">Histórico de partidas</h2><p className="muted">Resultado, campeão e desempenho de cada jogo.</p></div>
    <div className="history-filters"><label htmlFor="history-queue">Modo de jogo</label><select id="history-queue" value={queue} onChange={event => setQueue(event.target.value)}><option value="all">Todos os modos</option>{queues.map(id => <option key={id} value={id}>{queueLabel(id)}</option>)}</select><span className="history-count" aria-live="polite">{filtered.length} de {entries.length} partidas</span></div></div>
    {missingMatches > 0 && <p className="panel p-4 mb-4 text-amber-200">{missingMatches} partidas não estão mais disponíveis na Riot.</p>}
    {!filtered.length && <p className="panel p-8 muted" role="status">{entries.length ? 'Nenhuma partida deste modo nas últimas partidas carregadas.' : 'Nenhuma partida recente encontrada.'}</p>}
    <div className="match-list">{filtered.map(entry => <div key={entry.id}>{entry.card}</div>)}</div>
    <p className="history-note">Filtro aplicado às últimas {entries.length} partidas carregadas. Horários de Brasília. As estatísticas do perfil continuam considerando todos os modos. {demo ? 'Partidas fictícias de demonstração, sem consulta à Riot API.' : 'Dados em cache por até 2 minutos.'}</p>
  </section>;
}

