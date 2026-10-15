import Image from 'next/image';
import { asset } from '@/lib/riot';
import type { Participant } from '@/lib/types';

export function ItemBuild({ player, version }: { player: Participant; version: string }) {
  const items = [player.item0, player.item1, player.item2, player.item3, player.item4, player.item5, player.item6];
  return <div className="items" aria-label="Itens da partida">{items.map((item, index) => item
    ? <Image key={index} src={asset(version, 'item', item)} alt={`Item ${item}`} title={`Item ${item}`} width={28} height={28}/>
    : <span key={index} className="empty-item" aria-label="Espaço de item vazio"/>)}</div>;
}
