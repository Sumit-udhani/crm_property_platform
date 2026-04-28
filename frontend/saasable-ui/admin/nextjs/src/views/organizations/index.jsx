'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { DataGrid } from '@mui/x-data-grid';
import { IconBuildingCommunity, IconPencil } from '@tabler/icons-react';
import '../users/custom.css';
import organizationService from '@/services/organization.service';
import authService from '@/services/auth.service';
import Tooltip from '@mui/material/Tooltip';

export default function OrganizationsListView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem('orgCreated')) {
      enqueueSnackbar('Organization created successfully!', { variant: 'success' });
      sessionStorage.removeItem('orgCreated');
    }
    if (sessionStorage.getItem('orgUpdated')) {
      enqueueSnackbar('Organization updated successfully!', { variant: 'success' });
      sessionStorage.removeItem('orgUpdated');
    }
    

    const fetchUserAndOrgs = async () => {
      try {
        const userRes = await authService.getMe();
        if (userRes.success) {
          setCurrentUserRole(userRes.data.role_name?.toLowerCase());
        }
        
        const orgRes = await organizationService.getOrganizations();
        setOrganizations(orgRes.data || []);
      } catch (error) {
        enqueueSnackbar('Failed to load data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndOrgs();
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Organization Name', flex: 1.5,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', display: 'block' }}>
            {params.value}
          </span>
        </Tooltip>
      )
    },
    { field: 'code', headerName: 'Code', flex: 1 },
    { 
      field: 'created_at', 
      headerName: 'Created At', 
      flex: 1.5,
      valueGetter: (params) => {
        if (!params) return '';
        return new Date(params).toLocaleString();
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        if (currentUserRole !== 'super admin') return null;
        
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 0.5,
              height: '100%',
              width: '100%',
            }}
          >
            <IconButton
              size="small"
              onClick={() => router.push(`/dashboard/organizations/create?id=${row.id}`)}
            >
              <IconPencil size={16} />
            </IconButton>
          </Box>
        );
      },
    }
  ];

  // Only super admin or admin can create an organization
  const canCreate = currentUserRole === 'super admin' || currentUserRole === 'admin';

  return (
    <Box sx={{ width: '100%', px: 2, ml: '0px !important' }}> 
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          ml: '0px !important'
        }}
      >
        <Typography variant="h3">Organizations</Typography>

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<IconBuildingCommunity size={18} />}
            onClick={() => router.push('/dashboard/organizations/create')}
          >
            Add Organization
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto' }}> 
          <DataGrid
            rows={organizations}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            autoHeight
            rowHeight={56}
            sx={{
              minWidth: 800,
              width: '100%',
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              },
              '& .MuiDataGrid-row': {
                overflow: 'hidden',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
