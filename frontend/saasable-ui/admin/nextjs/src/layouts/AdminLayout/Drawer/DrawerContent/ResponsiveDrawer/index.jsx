'use client';

// @mui
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// @project
import menuItems from '@/menu';
import NavGroup from './NavGroup';
import { useAuth } from '@/contexts/AuthContext';
import { isSuperAdmin, isOrgAdmin, hasPermission } from '@/utils/permissions';


export default function ResponsiveDrawer() {
  const { user } = useAuth();

  const navGroups = menuItems.items.map((item, index) => {

    const clonedItem = { ...item };

    if (clonedItem.children) {
      clonedItem.children = clonedItem.children.filter((child) => {
      
        if (isSuperAdmin(user) ||isOrgAdmin(user)) return true;

        if (child.id === 'organizations' ) {
          return isOrgAdmin(user);
        }

        if (child.id === 'permissions') {
           return false; // Only super admin can see permissions link
        }

        // For other modules, check can_view permission
        // Mapping menu IDs to module names if they differ
        const moduleMap = {
           'users': 'users',
           'projects': 'projects',
           'branches': 'branches',
           'buildings': 'buildings',
           'roles': 'roles'
        };

        const moduleName = moduleMap[child.id];
        if (moduleName) {
           return hasPermission(user, moduleName, 'can_view');
        }

        return true;
      });
    }

    switch (clonedItem.type) {
      case 'group':
        return <NavGroup key={index} item={clonedItem} />;
      default:
        return (
          <Typography key={index} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ py: 1, transition: 'all 0.3s ease-in-out' }}>{navGroups}</Box>;
}
