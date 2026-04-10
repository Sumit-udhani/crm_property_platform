import dynamic from 'next/dynamic';

const UsersListView = dynamic(() => import('@/views/users'));

export default function UsersPage() {
  return <UsersListView />;
}