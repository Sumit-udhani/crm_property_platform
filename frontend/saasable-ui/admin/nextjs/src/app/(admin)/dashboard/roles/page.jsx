import dynamic from 'next/dynamic';

const RolesListView = dynamic(() => import('@/views/roles'));

export default function UsersPage() {
  return <RolesListView/>;
}