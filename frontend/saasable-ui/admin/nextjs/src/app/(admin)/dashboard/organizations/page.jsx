import dynamic from 'next/dynamic';

const OrganizationsListView = dynamic(() => import('@/views/organizations'));

export default function OrganizationsPage() {
  return <OrganizationsListView />;
}