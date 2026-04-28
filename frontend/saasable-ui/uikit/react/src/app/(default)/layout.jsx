import PropTypes from 'prop-types';

import dynamic from 'next/dynamic';


const ScrollFab = dynamic(() => import('@/components/ScrollFab'));

const MainLayout = dynamic(() => import('@/views/landings/default/layout'));


export default function AI({ children }) {
  return (
   
    <MainLayout>
      <>
        {children}

      
        <ScrollFab />
      </>
    </MainLayout>
   
  );
}

AI.propTypes = { children: PropTypes.any };
