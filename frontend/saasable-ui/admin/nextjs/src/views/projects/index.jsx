'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { DataGrid } from '@mui/x-data-grid';
import { IconPackage, IconPencil } from '@tabler/icons-react';
import '../users/custom.css';
import projectService from '@/services/project.service';
import authService from '@/services/auth.service';
import Tooltip from '@mui/material/Tooltip';

export default function ProjectsListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFilter = searchParams.get('userId');
  const { enqueueSnackbar } = useSnackbar();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem('projectCreated')) {
      enqueueSnackbar('Project created successfully!', { variant: 'success' });
      sessionStorage.removeItem('projectCreated');
    }
    if (sessionStorage.getItem('projectUpdated')) {
      enqueueSnackbar('Project updated successfully!', { variant: 'success' });
      sessionStorage.removeItem('projectUpdated');
    }
    
    const fetchUserAndProjects = async () => {
      try {
        const userRes = await authService.getMe();
        
        if (userRes.success) {
          setCurrentUserRole(userRes.data.role_name?.toLowerCase());
        }
        
        // Pass userIdFilter to getProjects if it exists
        const params = userIdFilter ? { userId: userIdFilter } : {};
        const projectRes = await projectService.getProjects(params);
       

        setProjects(projectRes.data || []);
      } catch (error) {
        enqueueSnackbar('Failed to load data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProjects();
  }, [userIdFilter]);

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN'); 
};

const columns = [
  { 
    field: 'srno', 
    headerName: 'Sr No', 
    width: 80,
    renderCell: (params) => {
      const index = params.api.getAllRowIds().indexOf(params.id);
      return index + 1;
    }
  },

  { 
    field: 'name', 
    headerName: 'Project Name', 
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

  { field: 'code', headerName: 'Code', flex: 1 },

  {
    field: 'status_name',
    headerName: 'Status',
    flex: 1,
    valueGetter: (value, row) => row?.project_status_name || '-'
  },


  {
    field: 'address_line_1',
    headerName: 'Address',
    flex: 1.5,
    valueGetter: (value, row) => row?.address || '-'
  },


  {
    field: 'country',
    headerName: 'Country',
    flex: 1,
    valueGetter: (value, row) => row?.country_name || '-'
  },

 
  {
  field: 'state',
  headerName: 'State',
  flex: 1,
  valueGetter: (value, row) => row?.state_name || '-'
},

 { field: 'city', headerName: 'City', flex: 1 },
  {
    field: 'start_date',
    headerName: 'Start Date',
    flex: 1,
    valueGetter: (value, row) => formatDate(row?.start_date)
  },

  {
    field: 'end_date',
    headerName: 'End Date',
    flex: 1,
    valueGetter: (value, row) => formatDate(row?.end_date)
  },

  {
    field: 'actions',
    headerName: 'Actions',
    flex: 1,
    sortable: false,
    renderCell: ({ row }) => {
      if (currentUserRole !== 'super admin'&& currentUserRole !== 'admin') return null;

      return (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          height: '100%',
        }}>
          <IconButton
            size="small"
            onClick={() => router.push(`/dashboard/projects/create?id=${row.id}`)}
          >
            <IconPencil size={16} />
          </IconButton>
        </Box>
      );
    },
  }
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
        <Typography variant="h3">Projects</Typography>

        <Button
          variant="contained"
          startIcon={<IconPackage size={18} />}
          onClick={() => router.push('/dashboard/projects/create')}
        >
          Add Project
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto' }}> 
          <DataGrid
            rows={projects}
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
