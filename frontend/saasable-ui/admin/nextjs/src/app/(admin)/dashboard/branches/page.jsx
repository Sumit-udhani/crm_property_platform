import dynamic from 'next/dynamic';

const BranchesListView = dynamic(() => import('@/views/branches'));

export default function BranchesPage() {
  return <BranchesListView />;
}