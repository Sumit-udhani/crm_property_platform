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
import { IconBuildingSkyscraper, IconPencil, IconTrash } from '@tabler/icons-react';
import '../users/custom.css';

import buildingService from '@/services/building.service';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/permissions';
import Tooltip from '@mui/material/Tooltip';
import AppBreadcrumb from '@/components/AppBreadcrumb';

export default function BuildingsListView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useAuth();

  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('buildingCreated')) {
      enqueueSnackbar('Building created successfully!', { variant: 'success' });
      sessionStorage.removeItem('buildingCreated');
    }
    if (sessionStorage.getItem('buildingUpdated')) {
      enqueueSnackbar('Building updated successfully!', { variant: 'success' });
      sessionStorage.removeItem('buildingUpdated');
    }
    
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const res = await buildingService.getBuildings();
      setBuildings(res.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to load buildings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuilding = async (id) => {
    if (!window.confirm('Are you sure you want to delete this building?')) return;
    try {
      await buildingService.deleteBuilding(id);
      enqueueSnackbar('Building deleted successfully', { variant: 'success' });
      fetchBuildings();
    } catch (error) {
      enqueueSnackbar('Failed to delete building', { variant: 'error' });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Building Name', flex: 1.5,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', display: 'block' }}>
            {params.value}
          </span>
        </Tooltip>
      )
    },
    { field: 'project_name', headerName: 'Project', flex: 1.5 },
    { field: 'building_type', headerName: 'Type', flex: 1 },
    { field: 'code', headerName: 'Code', flex: 1 },
    { field: 'total_floors', headerName: 'Floors', flex: 0.8, align: 'center', headerAlign: 'center' },
    { field: 'total_units', headerName: 'Units', flex: 0.8, align: 'center', headerAlign: 'center' },
    { field: 'city', headerName: 'City', flex: 1 },
    { field: 'state', headerName: 'State', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        if (!hasPermission(currentUser, 'buildings', 'can_edit')) return null;
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => router.push(`/dashboard/buildings/create?id=${row.id}`)}
              color="primary"
            >
              <IconPencil size={16} />
            </IconButton>
            {hasPermission(currentUser, 'buildings', 'can_delete') && (
              <IconButton
                size="small"
                onClick={() => handleDeleteBuilding(row.id)}
                color="error"
              >
                <IconTrash size={16} />
              </IconButton>
            )}
          </Box>
        );
      },
    }
  ];

  return (
    <Box sx={{ width: '100%', px: 2, ml: '0px !important' }}> 
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Buildings' }
        ]}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          ml: '0px !important'
        }}
      >
        <Typography variant="h3">Buildings</Typography>
        {hasPermission(currentUser, 'buildings', 'can_create') && (
          <Button
            variant="contained"
            startIcon={<IconBuildingSkyscraper size={18} />}
            onClick={() => router.push('/dashboard/buildings/create')}
          >
            Add Building
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
            rows={buildings}
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
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
