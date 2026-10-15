import Image from 'next/image';

const emblems: Record<string, { file: string; label: string }> = {
  IRON: { file: 'iron', label: 'Ferro' },
  BRONZE: { file: 'bronze', label: 'Bronze' },
  SILVER: { file: 'silver', label: 'Prata' },
  GOLD: { file: 'gold', label: 'Ouro' },
  PLATINUM: { file: 'platinum', label: 'Platina' },
  EMERALD: { file: 'emerald', label: 'Esmeralda' },
  DIAMOND: { file: 'diamond', label: 'Diamante' },
  MASTER: { file: 'master', label: 'Mestre' },
  GRANDMASTER: { file: 'grandmaster', label: 'Grão-Mestre' },
  CHALLENGER: { file: 'challenger', label: 'Desafiante' },
};

export function RankEmblem({ tier }: { tier?: string | null }) {
  const emblem = tier && Object.hasOwn(emblems, tier) ? emblems[tier] : null;
  return <span className="rank-icon">{emblem
    ? <Image src={`/ranks/${emblem.file}.png`} alt={`Emblema de ${emblem.label}`} width={64} height={64} sizes="64px"/>
    : <span className="rank-unclassified" aria-label="Sem emblema de classificação">—</span>}
  </span>;
}
