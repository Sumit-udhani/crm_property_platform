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
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';

import roleService from '@/services/role.service';

export default function RolesListView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [roles, setRoles]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('roleCreated')) {
      enqueueSnackbar('Role created successfully!', { variant: 'success' });
      sessionStorage.removeItem('roleCreated');
    }
    if (sessionStorage.getItem('roleUpdated')) {
      enqueueSnackbar('Role updated successfully!', { variant: 'success' });
      sessionStorage.removeItem('roleUpdated');
    }
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await roleService.getRoles();
      setRoles(res.data || []);
    } catch {
      enqueueSnackbar('Failed to load roles', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this role? This action cannot be undone.');
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await roleService.deleteRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      enqueueSnackbar('Role deleted successfully', { variant: 'success' });
    } catch (error) {
      const msg = error?.response?.data?.message || 'Delete failed. Please try again.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { field: 'id',   headerName: 'ID',        width: 80 },
    { field: 'name', headerName: 'Role Name',  flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
     renderCell: ({ row }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', // or 'flex-start' if you prefer left
      gap: 1,
      height: '100%',   // ✅ IMPORTANT
      width: '100%',    // ✅ IMPORTANT
    }}
  >
    <IconButton
      size="small"
      onClick={() => router.push(`/dashboard/roles/create?id=${row.id}`)}
    >
      <IconPencil size={18} />
    </IconButton>

    <IconButton
      size="small"
      onClick={() => handleDelete(row.id)}
      disabled={actionLoading}
    >
      <IconTrash size={18} />
    </IconButton>
  </Box>
),
    },
  ];

  return (
    <Box sx={{ width: '100%', px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h3">Roles</Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={() => router.push('/dashboard/roles/create')}
        >
          Add Role
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid
            rows={roles}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            autoHeight
            rowHeight={60}
            sx={{
              minWidth: 300,
              width: '100%',
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          />
        </Box>
      )}
    </Box>
  );
}