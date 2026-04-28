'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams  } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { IconArrowLeft } from '@tabler/icons-react';
import branchService from '@/services/branch.service';
import userService from '@/services/user.service';
import projectService from '@/services/project.service';
import ListItemText from '@mui/material/ListItemText';

export default function CreateUserView() {
  const router   = useRouter();
const searchParams = useSearchParams();
const editId = searchParams.get('id');   
const { enqueueSnackbar } = useSnackbar();
const isEdit = Boolean(editId);

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [roles, setRoles]               = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError]       = useState('');

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role_id: '',
      branch_ids: [],
      project_ids: [],
    }
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await userService.getRoles();
        setRoles(res.data || []);
      } catch {
        enqueueSnackbar('Failed to load roles', { variant: 'error' });
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

useEffect(() => {
  const fetchBranches = async () => {
    try {
      const res = await branchService.getBranches();
      setBranches(res.data || []);
    } catch {
      enqueueSnackbar('Failed to load branches', { variant: 'error' });
    } finally {
      setBranchesLoading(false);
    }
  };

  fetchBranches();
}, []);

useEffect(() => {
  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects();
      setProjects(res.data || []);
    } catch {
      enqueueSnackbar('Failed to load projects', { variant: 'error' });
    } finally {
      setProjectsLoading(false);
    }
  };

  fetchProjects();
}, []);

  useEffect(() => {
    if (!isEdit) return;

    const fetchUser = async () => {
      try {
        const res = await userService.getUsers();
        const user = (res.data || []).find((u) => String(u.id) === String(editId));
        if (user) {
          reset({
            first_name: user.first_name || '',
            last_name:  user.last_name  || '',
            email:      user.email      || '',
            phone:      user.phone      || '',
              role_id:    user.role_id ? String(user.role_id) : '',
              branch_ids: user.branches
    ? user.branches.map(b => String(b.id))
    : [],
    project_ids: user.projects
    ? user.projects.map(p => String(p.id))
    : []
          });
         
        }
      } catch {
        enqueueSnackbar('Failed to load user details', { variant: 'error' });
      }
    };
    fetchUser();
  }, [isEdit, editId,roles]);

  
  const onSubmit = async (data) => {
    setIsProcessing(true);
    setFormError('');
    try {
      if (isEdit) {
        const payload = {
  ...data,
  branch_ids: data.branch_ids || [],
  project_ids: data.project_ids || []
};
        await userService.editUser(editId, payload);
        sessionStorage.setItem('userUpdated', 'true');
      } else {
        await userService.createUser(data);
        sessionStorage.setItem('userCreated', 'true');
      }
      router.push('/dashboard/users');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Something went wrong. Please try again.';
      setFormError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
    
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          variant="text"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push('/dashboard/users')}
          sx={{ minWidth: 0 }}
        >
          Back
        </Button>
        <Typography variant="h3">{isEdit ? 'Edit User' : 'Create User'}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2.5}>

          <Box>
            <InputLabel required>First Name</InputLabel>
            <OutlinedInput
              {...register('first_name', { required: 'First name is required' })}
              placeholder="Enter first name"
              fullWidth
              error={Boolean(errors.first_name)}
            />
            {errors.first_name && <FormHelperText error>{errors.first_name.message}</FormHelperText>}
          </Box>

          <Box>
            <InputLabel>Last Name</InputLabel>
            <OutlinedInput
              {...register('last_name')}
              placeholder="Enter last name"
              fullWidth
            />
          </Box>

          <Box>
            <InputLabel required>Email</InputLabel>
            <OutlinedInput
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
              placeholder="Enter email"
              fullWidth
              error={Boolean(errors.email)}
              
              disabled={isEdit}
            />
            {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
          </Box>

       <Box>
  <InputLabel>Phone</InputLabel>

  <OutlinedInput
    {...register('phone', {
      pattern: {
        value: /^[0-9]{10}$/,
        message: 'Phone must be exactly 10 digits (numbers only)',
      },
    })}
    fullWidth
    placeholder="Enter phone number"
    error={Boolean(errors.phone)}
  />


  {errors.phone && (
    <FormHelperText error>
      {errors.phone.message}
    </FormHelperText>
  )}
</Box>
            <Box>
              <InputLabel>Branch</InputLabel>
              <Controller
                name="branch_ids"
                control={control}
                defaultValue=""
                render={({ field }) => (
                 <Select
  {...field}
  multiple   
  value={field.value || []}
  fullWidth
  renderValue={(selected) =>
    branches
      .filter(b => selected.includes(String(b.id)))
      .map(b => b.name)
      .join(', ')
  }
>
  {branches.map((b) => (
    <MenuItem key={b.id} value={String(b.id)}>
  <Checkbox checked={field.value?.includes(String(b.id))} />
  <ListItemText primary={b.name} />
</MenuItem>
  
  ))}
</Select>
                )}
              />
            </Box>

            <Box>
              <InputLabel>Projects</InputLabel>
              <Controller
                name="project_ids"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                 <Select
                  {...field}
                  multiple   
                  value={field.value || []}
                  fullWidth
                  disabled={projectsLoading}
                  renderValue={(selected) =>
                    projects
                      .filter(p => selected.includes(String(p.id)))
                      .map(p => p.name)
                      .join(', ')
                  }
                >
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>
                      <Checkbox checked={field.value?.includes(String(p.id))} />
                      <ListItemText primary={p.name} />
                    </MenuItem>
                  ))}
                </Select>
                )}
              />
            </Box>
          <Box>
            <InputLabel required>Role</InputLabel>
            <Controller
              name="role_id"
              control={control}
               defaultValue=""
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                   value={field.value || ''} 
                  fullWidth
                  displayEmpty
                  disabled={rolesLoading}
                  error={Boolean(errors.role_id)}
                  input={<OutlinedInput />}
                >
                  <MenuItem value="" disabled>
                    {rolesLoading ? 'Loading roles...' : 'Select a role'}
                  </MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={String(role.id)}>
                    {role.name}
                   </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.role_id && <FormHelperText error>{errors.role_id.message}</FormHelperText>}
          </Box>

          {formError && (
            <Alert severity="error" variant="filled" icon={false}>
              {formError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={isProcessing}
            endIcon={isProcessing && <CircularProgress color="secondary" size={16} />}
            sx={{ alignSelf: 'flex-start', minWidth: 160 }}
          >
            {isEdit ? 'Update User' : 'Create User'}
          </Button>

        </Stack>
      </form>
    </Box>
  );
}