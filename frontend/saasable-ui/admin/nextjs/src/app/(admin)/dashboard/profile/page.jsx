import dynamic from 'next/dynamic';
const EditProfileView = dynamic(() => import('@/views/profile'));
export default function ProfilePage() {
  return <EditProfileView />;
}