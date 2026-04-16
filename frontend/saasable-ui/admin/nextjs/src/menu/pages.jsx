/***************************  MENU ITEMS - PAGES  ***************************/

const pages = {
  id: 'group-page',
  title: 'Page',
  icon: 'IconDotsVertical',
  type: 'group',
  children: [
     {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/dashboard/users',
      icon: 'IconUsers'   
    },
    {
  id: 'roles',
  title: 'Roles',
  type: 'item',
  url: '/dashboard/roles',
  icon: 'IconShield', 
},
]
};

export default pages;
