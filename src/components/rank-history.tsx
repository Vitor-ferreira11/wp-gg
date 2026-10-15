import type { RankHistory as HistoryData } from '@/lib/rank-history';

function dateLabel(day: string) { const [year, month, date] = day.split('-'); return `${date}/${month}/${year}`; }

export function RankHistory({ history }: { history: HistoryData }) {
  return <details className="rank-history" id="historico-elo">
    <summary><span>Histórico de elo</span><small>Acompanhamento diário</small></summary>
    <div className="rank-history-content">
      <p className="rank-history-info">O WP.GG registra seu elo quando este perfil é consultado. Cada dia mantém a última classificação observada. Temporadas anteriores ao acompanhamento não estão disponíveis.</p>
      {history.unavailable ? <p className="rank-history-warning" role="status">Não foi possível salvar o histórico neste momento. A classificação atual continua disponível.</p> : <>
        {['RANKED_SOLO_5x5', 'RANKED_FLEX_SR'].map(queue => {
          const entries = history.snapshots.filter(s => s.queueType === queue);
          return <section className="rank-history-queue" key={queue} aria-label={`Histórico ${queue === 'RANKED_SOLO_5x5' ? 'Solo / Duo' : 'Flex'}`}>
            <h3>{queue === 'RANKED_SOLO_5x5' ? 'Solo / Duo' : 'Flex'}</h3>
            {entries.length === 0 ? <p className="muted">Ainda não há registros.</p> : <>
              {entries.length === 1 && <p className="rank-history-start">Primeiro registro salvo. Novas consultas em outros dias formarão seu histórico.</p>}
              <div className="rank-history-scroll" tabIndex={0} role="region" aria-label="Registros diários de elo">
                <table><caption className="sr-only">Últimos registros diários de classificação</caption><thead><tr><th scope="col">Data</th><th scope="col">Elo observado</th><th scope="col">LP</th><th scope="col">Vitórias / derrotas</th></tr></thead><tbody>
                  {entries.map(entry => <tr key={entry.day}><td><time dateTime={entry.day}>{dateLabel(entry.day)}</time></td><td>{entry.tier ? `${entry.tier} ${entry.rank ?? ''}` : 'Sem classificação'}</td><td>{entry.leaguePoints ?? '—'}</td><td>{entry.wins !== null ? `${entry.wins}V / ${entry.losses}D` : '—'}</td></tr>)}
                </tbody></table>
              </div>
              <p className="rank-history-footnote">Última consulta: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(entries[0].observedAt))} · Brasília.</p>
            </>}
          </section>;
        })}
      </>}
    </div>
  </details>;
}

