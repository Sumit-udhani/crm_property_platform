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
import { IconGitBranch, IconPencil } from '@tabler/icons-react';
import '../users/custom.css';
import branchService from '@/services/branch.service';
import authService from '@/services/auth.service';
import Tooltip from '@mui/material/Tooltip';

export default function BranchesListView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem('branchCreated')) {
      enqueueSnackbar('Branch created successfully!', { variant: 'success' });
      sessionStorage.removeItem('branchCreated');
    }
    if (sessionStorage.getItem('branchUpdated')) {
      enqueueSnackbar('Branch updated successfully!', { variant: 'success' });
      sessionStorage.removeItem('branchUpdated');
    }
    
    const fetchUserAndBranches = async () => {
      try {
        const userRes = await authService.getMe();
        if (userRes.success) {
          setCurrentUserRole(userRes.data.role_name?.toLowerCase());
        }
        
        const branchRes = await branchService.getBranches();
        console.log("branches",branchRes)
        setBranches(branchRes.data || []);
      } catch (error) {
        enqueueSnackbar('Failed to load data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndBranches();
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Branch Name', flex: 1.5,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', display: 'block' }}>
            {params.value}
          </span>
        </Tooltip>
      )
    },
    { field: 'organization_name', headerName: 'Organization', flex: 1.5,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', display: 'block' }}>
            {params.value}
          </span>
        </Tooltip>
      )
    },
    // {
    //   field: 'projects',
    //   headerName: 'Projects',
    //   flex: 1.5,
    //   valueGetter: (value, row) => {
    //     if (!row.projects || row.projects.length === 0) return '-';
    //     return row.projects.map(p => p.name).join(', ');
    //   },
    //   renderCell: (params) => (
    //     <Tooltip title={params.value || ''}>
    //       <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', display: 'block' }}>
    //         {params.value}
    //       </span>
    //     </Tooltip>
    //   )
    // },
    { field: 'code', headerName: 'Code', flex: 1 },
   {
    field: 'country',
    headerName: 'Country',
    flex: 1,
    valueGetter: (value, row) => row?.country || '-'
  },

  { field: 'city', headerName: 'City', flex: 1 },
  { field: 'state', headerName: 'State', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'phone', headerName: 'Phone', flex: 1 },
  { field: 'address_line_1', headerName: 'Address', flex: 1 },
  { field: 'postal_code', headerName: 'PostalCode', flex: 1 },



    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
      
        if (currentUserRole !== 'super admin' && currentUserRole !== 'admin' ) return null;
        
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
              onClick={() => router.push(`/dashboard/branches/create?id=${row.id}`)}
            >
              <IconPencil size={16} />
            </IconButton>
          </Box>
        );
      },
    }
  ];
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
        <Typography variant="h3">Branches</Typography>
{canCreate&&(

<Button
  variant="contained"
  startIcon={<IconGitBranch size={18} />}
  onClick={() => router.push('/dashboard/branches/create')}
>
  Add Branch
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
            rows={branches}
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