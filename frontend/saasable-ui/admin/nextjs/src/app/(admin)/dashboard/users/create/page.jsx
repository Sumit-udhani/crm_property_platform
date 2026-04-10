import dynamic from 'next/dynamic';

const CreateUserView = dynamic(() => import('@/views/users/create'));

export default function CreateUserPage() {
  return <CreateUserView />;
}