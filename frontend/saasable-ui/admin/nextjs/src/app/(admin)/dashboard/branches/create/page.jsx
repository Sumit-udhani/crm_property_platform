import dynamic from 'next/dynamic';

const CreateBranchView = dynamic(() => import('@/views/branches/create'));

export default function CreateBranchPage() {
  return <CreateBranchView />;
}