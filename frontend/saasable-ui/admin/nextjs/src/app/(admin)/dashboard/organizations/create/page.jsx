import dynamic from 'next/dynamic';

const CreateOrganizationView = dynamic(() => import('@/views/organizations/create'));

export default function CreateOrganizationPage() {
  return <CreateOrganizationView />;
}