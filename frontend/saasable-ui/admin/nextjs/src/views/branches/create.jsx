'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import locationService from '@/services/location.service';
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
import Grid from '@mui/material/Grid';
import { IconArrowLeft } from '@tabler/icons-react';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';

import branchService from '@/services/branch.service';
import organizationService from '@/services/organization.service';
import projectService from '@/services/project.service';

export default function CreateBranchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const { enqueueSnackbar } = useSnackbar();
const [countries, setCountries] = useState([]);
const [states, setStates] = useState([]);


const [selectedCountry, setSelectedCountry] = useState('');
const [selectedState, setSelectedState] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

 const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
  defaultValues: {
    organization_id: '',
    name: '',
    email: '',
    phone: '',
    code: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    project_ids: [],
  }
});

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await organizationService.getOrganizations();
        setOrganizations(res.data || []);
      } catch (error) {
        enqueueSnackbar('Failed to load organizations', { variant: 'error' });
      } finally {
        setOrgsLoading(false);
      }
    };
    fetchOrgs();
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!isEdit) {
      setProjectsLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await projectService.getAvailableProjects(editId);
        setProjects(res.data || []);
      } catch {
        enqueueSnackbar('Failed to load projects', { variant: 'error' });
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [isEdit, enqueueSnackbar]);

  useEffect(() => {
  const fetchCountries = async () => {
    try {
      const res = await locationService.getCountries();
      setCountries(res.data || []);
    } catch {
      enqueueSnackbar('Failed to load countries', { variant: 'error' });
    }
  };

  fetchCountries();
}, []);
const handleCountryChange = async (value) => {
  setSelectedCountry(value);
  setSelectedState('');

  if (!value) return;

  const res = await locationService.getStates(value);
  setStates(res.data || []);
};

  useEffect(() => {
    if (!isEdit) return;

    const fetchBranch = async () => {
      try {
        const res = await branchService.getBranches();
        const branch = (res.data || []).find((b) => String(b.id) === String(editId));
       if (branch) {
  const country = branch.country_id || '';
  const state = branch.state_id || '';
  const city = branch.city_name || branch.city||'';

  reset({
    organization_id: branch.organization_id ? String(branch.organization_id) : '',
    name: branch.name || '',
    email: branch.email || '',
    phone: branch.phone || '',
    code: branch.code || '',
    address_line_1: branch.address_line_1 || '',
    address_line_2: branch.address_line_2 || '',
    city,
    state,
    country,
    postal_code: branch.postal_code || '',
    project_ids: branch.projects ? branch.projects.map(p => String(p.id)) : [],
  });

 
  setSelectedCountry(country);

  if (country) {
    const stateRes = await locationService.getStates(country);
    setStates(stateRes.data || []);
  }

  setSelectedState(state);


  
}
      } catch (error) {
        enqueueSnackbar('Failed to load branch details', { variant: 'error' });
      }
    };
    fetchBranch();
  }, [isEdit, editId, reset, enqueueSnackbar]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setFormError('');
    try {
      if (isEdit) {
        const payload = {
          ...data,
          project_ids: data.project_ids || []
        };
        await branchService.editBranch(editId, payload);
        sessionStorage.setItem('branchUpdated', 'true');
      } else {
        await branchService.createBranch(data);
        sessionStorage.setItem('branchCreated', 'true');
      }
      router.push('/dashboard/branches');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Something went wrong. Please try again.';
      setFormError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
    
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          variant="text"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push('/dashboard/branches')}
          sx={{ minWidth: 0 }}
        >
          Back
        </Button>
        <Typography variant="h3">{isEdit ? 'Edit Branch' : 'Create Branch'}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2.5}>
          <Grid container spacing={2}>
            {!isEdit && (
              <Grid item xs={12}>
                <InputLabel required>Organization</InputLabel>
                <Controller
                  name="organization_id"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Organization is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value || ''}
                      fullWidth
                      displayEmpty
                      disabled={orgsLoading}
                      error={Boolean(errors.organization_id)}
                      input={<OutlinedInput />}
                    >
                      <MenuItem value="" disabled>
                        {orgsLoading ? 'Loading organizations...' : 'Select an organization'}
                      </MenuItem>
                      {organizations.map((org) => (
                        <MenuItem key={org.id} value={String(org.id)}>
                          {org.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.organization_id && <FormHelperText error>{errors.organization_id.message}</FormHelperText>}
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <InputLabel required>Branch Name</InputLabel>
              <OutlinedInput
                {...register('name', { required: 'Branch name is required' })}
                placeholder="Enter branch name"
                fullWidth
                error={Boolean(errors.name)}
              />
              {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
            </Grid>

            {isEdit && (
              <Grid item xs={12} sm={6}>
                <InputLabel required>Branch Code</InputLabel>
                <OutlinedInput
                  {...register('code', { required: 'Branch code is required' })}
                  placeholder="Enter branch code"
                  fullWidth
                  error={Boolean(errors.code)}
                />
                {errors.code && <FormHelperText error>{errors.code.message}</FormHelperText>}
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <InputLabel required>Email</InputLabel>
              <OutlinedInput
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                placeholder="Enter email"
                fullWidth
                error={Boolean(errors.email)}
              />
              {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel required>Phone</InputLabel>
              <OutlinedInput
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: { value: /^\d{10}$/, message: 'Phone must be exactly 10 digits' },
                })}
                placeholder="Enter 10-digit phone number"
                fullWidth
                error={Boolean(errors.phone)}
              />
              {errors.phone && <FormHelperText error>{errors.phone.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <InputLabel required>Address Line 1</InputLabel>
              <OutlinedInput
                {...register('address_line_1', { required: 'Address is required' })}
                placeholder="Enter address line 1"
                fullWidth
                error={Boolean(errors.address_line_1)}
              />
              {errors.address_line_1 && <FormHelperText error>{errors.address_line_1.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <InputLabel>Address Line 2</InputLabel>
              <OutlinedInput
                {...register('address_line_2')}
                placeholder="Enter address line 2 (optional)"
                fullWidth
              />
            </Grid>
                    <Grid item xs={12} sm={6}>
            <InputLabel required>Country</InputLabel>
            <Controller
              name="country"
              control={control}
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleCountryChange(e.target.value);
                  }}
                  error={Boolean(errors.country)}
                >
                  <MenuItem value="">Select Country</MenuItem>
                  {countries.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel required>State</InputLabel>
            <Controller
              name="state"
              control={control}
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  value={field.value || ''}
                  disabled={!selectedCountry}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                   
                  }}
                  error={Boolean(errors.state)}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {states.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Grid>

                      <Grid item xs={12} sm={6}>
            <InputLabel required>City</InputLabel>
          <Controller
  name="city"
  control={control}
  rules={{ required: 'City is required' }}
  render={({ field }) => (
    <OutlinedInput
      {...field}
      value={field.value || ''}   
      fullWidth
      placeholder="Enter city"
      error={Boolean(errors.city)}
    />
  )}
/>
          </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel required>Postal Code</InputLabel>
              <OutlinedInput
                {...register('postal_code', { required: 'Postal code is required' })}
                placeholder="Enter postal code"
                fullWidth
                error={Boolean(errors.postal_code)}
              />
              {errors.postal_code && <FormHelperText error>{errors.postal_code.message}</FormHelperText>}
            </Grid>

            {isEdit && (
              <Grid item xs={12}>
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
                      {projectsLoading ? (
                        <MenuItem disabled>Loading projects...</MenuItem>
                      ) : projects.length === 0 ? (
                        <MenuItem disabled>No projects available</MenuItem>
                      ) : (
                        projects.map((project) => (
                          <MenuItem key={project.id} value={String(project.id)}>
                            <Checkbox checked={field.value?.includes(String(project.id))} />
                            <ListItemText primary={project.name} />
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )}
                />
              </Grid>
            )}
          </Grid>

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
            sx={{ alignSelf: 'flex-start', minWidth: 200 }}
          >
            {isEdit ? 'Update Branch' : 'Create Branch'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}