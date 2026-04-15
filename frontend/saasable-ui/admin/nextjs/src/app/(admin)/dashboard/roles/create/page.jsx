import dynamic from 'next/dynamic';

const CreateRoleView = dynamic(() => import('@/views/roles/create'));

export default function CreateUserPage() {
  return <CreateRoleView />;
}