import Image from 'next/image';
import Link from 'next/link';
import { asset } from '@/lib/riot';
import { csPerMinute, profileHref, isPlatform } from '@/lib/stats';
import { killParticipation, matchTeams, positionLabel } from '@/lib/match-stats';
import type { Champion, Match } from '@/lib/types';
import { ItemBuild } from './item-build';

type Props = { match: Match; puuid: string; version: string; champions: Record<string, Champion> };
const number = (value: number) => value.toLocaleString('pt-BR');

export function MatchTeams({ match, puuid, version, champions }: Props) {
  const teams = matchTeams(match.info.participants);
  const maxDamage = Math.max(1, ...match.info.participants.map(p => p.totalDamageDealtToChampions));
  const platform = match.metadata.matchId.split('_')[0].toLowerCase();
  const championById = new Map(Object.values(champions).map(c => [Number(c.key), c]));

  return <div className="match-teams">
    <div className="teams-intro"><h3>Jogadores da partida</h3><span>O jogador consultado está destacado.</span></div>
    <p className="table-scroll-hint">Deslize a tabela para ver todas as estatísticas.</p>
    {teams.map((team, index) => {
      const label = team.id === 100 ? 'Time azul' : team.id === 200 ? 'Time vermelho' : team.id === 0 ? 'Participantes' : `Equipe ${index + 1}`;
      return <section className={`team-section ${team.win === true ? 'team-victory' : team.win === false ? 'team-defeat' : ''}`} key={team.id} aria-label={label}>
        <header className="team-heading"><div><h4>{label}</h4>{team.win !== null && <span className="team-result">{team.win ? 'Vitória' : 'Derrota'}</span>}</div><p>{team.players.length} jogadores <span>· {team.kills} abates</span>{team.gold !== null && <span> · {number(team.gold)} ouro</span>}</p></header>
        <div className="scoreboard-scroll" role="region" aria-label={`Estatísticas: ${label}`} tabIndex={0}>
          <table className="scoreboard">
            <caption className="sr-only">Campeão, jogador, KDA, participação em abates, dano a campeões, visão, farm e itens — {label}</caption>
            <thead><tr><th scope="col">Jogador</th><th scope="col">K/D/A</th><th scope="col">Dano <small>a campeões</small></th><th scope="col">Visão</th><th scope="col">Farm</th><th scope="col">Itens</th></tr></thead>
            <tbody>{team.players.map((player, playerIndex) => {
              const champion = championById.get(player.championId);
              const riotId = player.riotIdGameName && player.riotIdTagline ? `${player.riotIdGameName}#${player.riotIdTagline}` : null;
              const selected = player.puuid === puuid;
              const name = player.riotIdGameName || `Jogador ${playerIndex + 1}`;
              return <tr key={player.puuid || playerIndex} className={selected ? 'selected-player' : undefined}>
                <th scope="row"><div className="scoreboard-player"><div className="scoreboard-portrait">{champion ? <Image src={asset(version, 'champion', champion.id)} alt={champion.name} width={36} height={36}/> : <span className="champion-placeholder">?</span>}{player.champLevel !== undefined && <span>{player.champLevel}</span>}</div><div className="scoreboard-name">{riotId && isPlatform(platform) ? <Link href={profileHref(platform, riotId)} prefetch={false} title={riotId}>{name}<span>#{player.riotIdTagline}</span></Link> : <strong>{name}</strong>}<small>{champion?.name ?? player.championName} · {positionLabel(player.teamPosition)}{selected && <span className="you-label">Perfil</span>}</small></div></div></th>
                <td><strong className="scoreboard-kda">{player.kills}<span> / {player.deaths} / </span>{player.assists}</strong><small>{player.deaths ? `${((player.kills + player.assists) / player.deaths).toFixed(2)} KDA` : 'KDA perfeito'} · {killParticipation(player, team.kills)}% PA</small></td>
                <td><strong>{number(player.totalDamageDealtToChampions)}</strong><span className="damage-bar" aria-hidden="true"><span style={{ width: `${player.totalDamageDealtToChampions / maxDamage * 100}%` }}/></span></td>
                <td><strong>{player.visionScore}</strong><small>pontos</small></td>
                <td><strong>{player.totalMinionsKilled + player.neutralMinionsKilled} CS</strong><small>{csPerMinute(player, match.info.gameDuration)} / min</small></td>
                <td><ItemBuild player={player} version={version}/></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </section>;
    })}
    <p className="scoreboard-note">PA: participação nos abates do time. Dados registrados nesta partida. <span>{match.metadata.matchId}</span></p>
  </div>;
}
