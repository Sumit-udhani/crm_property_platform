'use client';

// @mui
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// @project
import menuItems from '@/menu';
import NavGroup from './NavGroup';
import authService from '@/services/auth.service';
import { isSuperAdmin, isOrgAdmin } from '@/utils/permissions';


export default function ResponsiveDrawer() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user for sidebar:', error);
      }
    };
    fetchUser();
  }, []);

  const navGroups = menuItems.items.map((item, index) => {

    const clonedItem = { ...item };

    if (clonedItem.children) {
      clonedItem.children = clonedItem.children.filter((child) => {
        if (child.id === 'organizations' ) {
          return isSuperAdmin(user) || isOrgAdmin(user);
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
