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
  id: 'permissions',
  title: 'Permissions',
  type: 'item',
  url: '/dashboard/permissions',
  icon: 'IconLockAccess', 
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
  id: 'buildings',
  title: 'Buildings',
  type: 'item',
  url: '/dashboard/buildings',
  icon: 'IconBuildingSkyscraper', 
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
