'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import { DataGrid } from '@mui/x-data-grid';
import { IconUserPlus, IconPencil,IconTrash } from '@tabler/icons-react';
import './custom.css'
import userService from '@/services/user.service';
import SuspendDialog from '@/components/users/SuspendDialog';  
import Tooltip from '@mui/material/Tooltip';

const StatusChip = ({ user }) => {
  const status = user.computedStatus || 'active';

  const map = {
    suspended:   { label: 'Suspended',   bgColor: '#FFF4E5', textColor: '#B26A00' },
    deactivated: { label: 'Deactivated', bgColor: '#FDECEA', textColor: '#B71C1C' },
    active:      { label: 'Active',      bgColor: '#E6F4EA', textColor: '#1B5E20' },
  };

  const { label, bgColor, textColor } = map[status];

  return (
    <Box
      sx={{
        px: 1.8,
        py: 0.4,
        borderRadius: '99px',
        fontSize: 12,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        color: textColor,
        minWidth: 100,
        height: 38
      }}
      
     >
      {label}
    </Box>
  );
};

const getUserStatus = (user) => user.computedStatus || 'active';
export default function UsersListView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [suspendError, setSuspendError]   = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('userCreated')) {
      enqueueSnackbar('User created successfully!', { variant: 'success' });
      sessionStorage.removeItem('userCreated');
    }
    if (sessionStorage.getItem('userUpdated')) {
      enqueueSnackbar('User updated successfully!', { variant: 'success' });
      sessionStorage.removeItem('userUpdated');
    }
    fetchUsers();
  }, []);

  // In fetchUsers — add computed status field
const fetchUsers = async () => {
  try {
    const res = await userService.getUsers();
    console.log(res);
    const usersWithStatus = (res.data || []).map((u) => ({
      ...u,
      computedStatus: u.suspended_at && u.suspend_reason
        ? 'suspended'
        : u.is_active === false
        ? 'deactivated'
        : 'active',
    }));
    setUsers(usersWithStatus);
  } catch {
    enqueueSnackbar('Failed to load users', { variant: 'error' });
  } finally {
    setLoading(false);
  }
};

const handleStatusAction = async (action, user) => {
  if (action === 'suspend') {
    setSelectedUser(user);
    setSuspendError('');
    setSuspendDialog(true);
    return;
  }

  setActionLoading(true);
  try {
    const res = await userService.updateUserStatus(user.id, { action });
    console.log(res.data);
    const updatedUser =  res.data.data; 
  setUsers((prev) =>
  prev.map((u) =>
    String(u.id) === String(updatedUser.id)
      ? {
          ...u,
          ...updatedUser,
          computedStatus: updatedUser.suspended_at && updatedUser.suspend_reason
            ? 'suspended'
            : updatedUser.is_active === false
            ? 'deactivated'
            : 'active',
          _updatedAt: Date.now(),
        }
      : u
  )
);


    const toastMap = {
      deactivate: 'User deactivated successfully',
      reactivate: 'User reactivated successfully',
    };
    enqueueSnackbar(toastMap[action], { variant: 'success' });
  } catch (error) {
    const msg = error?.response?.data?.message || 'Action failed. Please try again.';
    enqueueSnackbar(msg, { variant: 'error' });
  } finally {
    setActionLoading(false);
  }
};

 const handleDeleteUser = async (userId) => {
  const confirmed = window.confirm(`Are you sure you want to delete this user? This action cannot be undone.`);
  
  if (!confirmed) return;

  setActionLoading(true);
  try {
    await userService.deleteUser(userId);
    enqueueSnackbar('User deleted successfully', { variant: 'success' });
    fetchUsers();
  } catch (error) {
    const msg = error?.response?.data?.message || 'Delete failed. Please try again.';
    enqueueSnackbar(msg, { variant: 'error' });
  } finally {
    setActionLoading(false);
  }
};
  const handleSuspendSubmit = async ({ suspend_reason, suspend_days }) => {
  setActionLoading(true);
  try {
    const res = await userService.updateUserStatus(selectedUser.id, {
      action: 'suspend',
      suspend_reason,
      suspend_days,
    });
    const updatedUser =  res.data.data;;

   setUsers((prev) =>
  prev.map((u) =>
    String(u.id) === String(updatedUser.id)
      ? {
          ...u,
          ...updatedUser,
          computedStatus: updatedUser.suspended_at && updatedUser.suspend_reason
            ? 'suspended'
            : updatedUser.is_active === false
            ? 'deactivated'
            : 'active',
          _updatedAt: Date.now(),
        }
      : u
  )
);
    enqueueSnackbar('User suspended successfully', { variant: 'success' });
    setSuspendDialog(false);
    setSelectedUser(null);
  } catch (error) {
    const msg = error?.response?.data?.message || 'Suspend failed. Please try again.';
    setSuspendError(msg);
  } finally {
    setActionLoading(false);
  }
};
  const columns = [
    { field: 'id',         headerName: 'ID',        width: 80 },
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'last_name',  headerName: 'Last Name',  flex: 1 },
    {
  field: 'email',
  headerName: 'Email',
  flex: 1.5,
  renderCell: (params) => (
    <Tooltip title={params.value || ''}>
      <span style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
        display: 'block'
      }}>
        {params.value}
      </span>
    </Tooltip>
  )
},
    { field: 'phone',      headerName: 'Phone',      flex: 1 },
    { field: 'role_name',  headerName: 'Role',       flex: 1 },
   {
  field: 'branch_names',
  headerName: 'Branch',
  flex: 1,
},
{
  field: 'project_count',
  headerName: 'Projects',
  flex: 1,
  renderCell: ({ row }) => (
    <Typography
      component="a"
      href={`/dashboard/projects?userId=${row.id}`}
      target="_blank"
      sx={{
        color: 'primary.main',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline'
        }
      }}
    >
      {row.project_count || 0} Projects
    </Typography>
  )
},
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: ({ row }) => <StatusChip user={row} />,
    },
   {
  field: 'actions',
  headerName: 'Actions',
  flex: 1.5,
  sortable: false,
  renderCell: ({ row }) => {
    const status = getUserStatus(row);
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 0.5,
          height: '100%',      // ← fill full row height
          width: '100%',
        }}
      >
        <IconButton
          size="small"
          onClick={() => router.push(`/dashboard/users/create?id=${row.id}`)}
        >
          <IconPencil size={16} />
        </IconButton>

        {row.role_name !== 'SUPER ADMIN' &&(
          <IconButton
            size="small"
            onClick={() => handleDeleteUser(row.id)}
            disabled={actionLoading}
          >
            <IconTrash size={16} />
          </IconButton>
        )}

        <Select
          size="small"
          displayEmpty
          value=""
          onChange={(e) => handleStatusAction(e.target.value, row)}
          sx={{
            fontSize: 12,
            height: 32,        // ← fixed height so it fits in row
            minWidth: 110,
            maxWidth: 110,
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
          }}
          disabled={actionLoading}
        >
          <MenuItem value="" disabled sx={{ fontSize: 12 }}>Status</MenuItem>
          {status === 'active' && [
            <MenuItem key="suspend"    value="suspend"    sx={{ fontSize: 12 }}>Suspend</MenuItem>,
            <MenuItem key="deactivate" value="deactivate" sx={{ fontSize: 12 }}>Deactivate</MenuItem>,
          ]}
          {status === 'suspended' && [
            <MenuItem key="reactivate" value="reactivate" sx={{ fontSize: 12 }}>Activate</MenuItem>,
            <MenuItem key="deactivate" value="deactivate" sx={{ fontSize: 12 }}>Deactivate</MenuItem>,
          ]}
          {status === 'deactivated' && [
            <MenuItem key="reactivate" value="reactivate" sx={{ fontSize: 12 }}>Activate</MenuItem>,
            <MenuItem key="suspend"    value="suspend"    sx={{ fontSize: 12 }}>Suspend</MenuItem>,
          ]}
        </Select>
      </Box>
    );
  },
},
  ];

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
      <Box sx={{ width: '100%', overflowX: 'auto' }}> 
        <DataGrid
  rows={users}
  columns={columns}
  getRowId={(row) => row.id}
  pageSizeOptions={[10, 25, 50]}
  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
  disableRowSelectionOnClick
  autoHeight
  rowHeight={56}
  sx={{
  minWidth: 1000,
  width: '100%',
  bgcolor: 'background.paper',
  borderRadius: 2,

  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',           // ✅ FIX
    whiteSpace: 'nowrap',         // ✅ prevent wrap
    textOverflow: 'ellipsis',     // ✅ add ...
  },

  '& .MuiDataGrid-row': {
    overflow: 'hidden',           // ✅ FIX
  },
}}
/>
      </Box>
    )}

   
    <SuspendDialog
      open={suspendDialog}
      onClose={() => {
        setSuspendDialog(false);
        setSelectedUser(null);
      }}
      onSubmit={handleSuspendSubmit}
      loading={actionLoading}
      error={suspendError}
      setError={setSuspendError}
    />
  </Box>
);
}