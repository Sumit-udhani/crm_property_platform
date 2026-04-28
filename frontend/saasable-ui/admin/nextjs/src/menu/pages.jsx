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
{
  id: 'organizations',
  title: 'Organizations',
  type: 'item',
  url: '/dashboard/organizations',
  icon: 'IconBuildingCommunity', 
},
{
  id: 'branches',
  title: 'Branches',
  type: 'item',
  url: '/dashboard/branches',
  icon: 'IconGitBranch', 
},
{
  id: 'projects',
  title: 'Projects',
  type: 'item',
  url: '/dashboard/projects',
  icon: 'IconPackage', 
},
]
};

export default pages;
