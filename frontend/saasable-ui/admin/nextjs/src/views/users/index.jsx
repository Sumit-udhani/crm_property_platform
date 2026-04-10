'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';
import { IconUserPlus } from '@tabler/icons-react';

import userService from '@/services/user.service';

const columns = [
  { field: 'id',         headerName: 'ID',         width: 80 },
  { field: 'first_name', headerName: 'First Name',  flex: 1 },
  { field: 'last_name',  headerName: 'Last Name',   flex: 1 },
  { field: 'email',      headerName: 'Email',       flex: 1.5 },
  { field: 'phone',      headerName: 'Phone',       flex: 1 },
  { field: 'role_name',  headerName: 'Role',        flex: 1 },
];

export default function UsersListView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    if (sessionStorage.getItem('userCreated')) {
      enqueueSnackbar('User created successfully!', { variant: 'success' });
      sessionStorage.removeItem('userCreated');
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.getUsers();
      setUsers(res.data || []);
    } catch {
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h3">Users</Typography>
        <Button
          variant="contained"
          startIcon={<IconUserPlus size={18} />}
          onClick={() => router.push('/dashboard/users/create')}
        >
          Add User
        </Button>
      </Box>

     
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={users}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          autoHeight
          sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
        />
      )}
    </Box>
  );
}