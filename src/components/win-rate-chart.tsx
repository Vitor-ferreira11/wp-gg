export function WinRateChart({ wins, losses }: { wins: number; losses: number }) {
  const games = wins + losses;
  const rate = games ? Math.round(wins / games * 100) : 0;
  const circumference = 2 * Math.PI * 42;
  return <figure className="win-rate-chart" aria-label={games ? `${rate}% de vitórias: ${wins} vitórias e ${losses} derrotas em ${games} partidas` : 'Nenhuma partida disponível'}>
    <div className="win-rate-ring">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke={games ? '#dc657b' : '#283b55'} strokeWidth="10"/>
        {games > 0 && <circle cx="50" cy="50" r="42" fill="none" stroke="#72a5f5" strokeWidth="10" strokeDasharray={`${wins / games * circumference} ${circumference}`} transform="rotate(-90 50 50)"/>}
      </svg>
      <strong>{games ? `${rate}%` : '—'}</strong>
    </div>
    <figcaption><span>Últimas {games} partidas</span><div><span className="chart-wins">{wins} vitórias</span><span className="chart-losses">{losses} derrotas</span></div></figcaption>
  </figure>;
}
