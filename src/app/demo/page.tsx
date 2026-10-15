import { ProfileView } from '@/components/profile-view';
import { getDemoProfile } from '@/lib/demo-profile';

export const metadata = { title: 'Demonstração', description: 'Explore o WP.GG com um perfil fictício, sem precisar de chave Riot.' };
export default function DemoPage() {
  return <ProfileView data={getDemoProfile()} platform="br1" demo/>;
}
