'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import locationService from '@/services/location.service';
import projectService from '@/services/project.service';
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
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { IconArrowLeft } from '@tabler/icons-react';

export default function CreateProjectView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const { enqueueSnackbar } = useSnackbar();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const [projectStatuses, setProjectStatuses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      project_status_id: '',
      name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      start_date: '',
      end_date: '',
    }
  });

  const selectedCountry = watch('country');
  const selectedState = watch('state');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, statusRes] = await Promise.all([
          locationService.getCountries(),
          projectService.getProjectStatuses(),
        ]);
        
        setCountries(countryRes.data || []);
        setProjectStatuses(statusRes.data || []);
      } catch (error) {
        enqueueSnackbar('Failed to load initial data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
     
      return;
    }
    const fetchStates = async () => {
      try {
        const res = await locationService.getStates(selectedCountry);
        setStates(res.data || []);
      } catch {
        enqueueSnackbar('Failed to load states', { variant: 'error' });
      }
    };
    fetchStates();
  }, [selectedCountry, enqueueSnackbar]);



  useEffect(() => {
    if (!isEdit) return;

    const fetchProject = async () => {
      try {
        const res = await projectService.getProjects();
        console.log("raw res:", res);              
    console.log("res.data:", res.data);        
    const project = (res.data || []).find((p) => String(p.id) === String(editId));
    console.log("editId:", editId, typeof editId)
        if (project) {
          
        
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toISOString().split('T')[0];
          };

          reset({
            project_status_id: project.project_status_id ? String(project.project_status_id) : '',
            name: project.name || '',
            address_line_1: project.address_line_1 || '',
            address_line_2: project.address_line_2 || '',
           city:              project.city              ? String(project.city)   : '',  // ID as string
  state:             project.state             ? String(project.state)  : '',  // ID as string
  country:           project.country           ? String(project.country): '', 
            postal_code: project.postal_code || '',
            start_date: formatDate(project.start_date),
            end_date: formatDate(project.end_date),
          });
        }
      } catch (error) {
        enqueueSnackbar('Failed to load project details', { variant: 'error' });
      }
    };
    fetchProject();
  }, [isEdit, editId, reset, enqueueSnackbar]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setFormError('');
    try {
      if (isEdit) {
        await projectService.editProject(editId, data);
        sessionStorage.setItem('projectUpdated', 'true');
      } else {
        await projectService.createProject(data);
        sessionStorage.setItem('projectCreated', 'true');
      }
      router.push('/dashboard/projects');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Something went wrong. Please try again.';
      setFormError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          variant="text"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push('/dashboard/projects')}
          sx={{ minWidth: 0 }}
        >
          Back
        </Button>
        <Typography variant="h3">{isEdit ? 'Edit Project' : 'Create Project'}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InputLabel required>Project Status</InputLabel>
              <Controller
                name="project_status_id"
                control={control}
                rules={{ required: 'Project status is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    displayEmpty
                    error={Boolean(errors.project_status_id)}
                    input={<OutlinedInput />}
                  >
                    <MenuItem value="" disabled>Select a status</MenuItem>
                    {projectStatuses.map((status) => (
                      <MenuItem key={status.id} value={String(status.id)}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.project_status_id && <FormHelperText error>{errors.project_status_id.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <InputLabel required>Project Name</InputLabel>
              <OutlinedInput
                {...register('name', { required: 'Project name is required' })}
                placeholder="Enter project name"
                fullWidth
                error={Boolean(errors.name)}
              />
              {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <InputLabel required>Address Line 1</InputLabel>
              <OutlinedInput
                {...register('address_line_1', { required: 'Address is required' })}
                placeholder="Enter address"
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

            <Grid item xs={12} sm={4}>
              <InputLabel required>Country</InputLabel>
              <Controller
                name="country"
                control={control}
                rules={{ required: 'Country is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    displayEmpty
                    error={Boolean(errors.country)}
                    input={<OutlinedInput />}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setValue('state', '');
                      setValue('city', '');
                    }}
                  >
                    <MenuItem value="" disabled>Select Country</MenuItem>
                    {countries.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.country && <FormHelperText error>{errors.country.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12} sm={4}>
              <InputLabel required>State</InputLabel>
              <Controller
                name="state"
                control={control}
                rules={{ required: 'State is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    displayEmpty
                    error={Boolean(errors.state)}
                    input={<OutlinedInput />}
                    disabled={!selectedCountry}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setValue('city', '');
                    }}
                  >
                    <MenuItem value="" disabled>Select State</MenuItem>
                    {states.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.state && <FormHelperText error>{errors.state.message}</FormHelperText>}
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
                  fullWidth
                  placeholder="Enter city"
                  error={Boolean(errors.city)}
                />
              )}
            />
          </Grid>

            <Grid item xs={12} sm={4}>
              <InputLabel required>Postal Code</InputLabel>
              <OutlinedInput
                {...register('postal_code', { required: 'Postal code is required' })}
                placeholder="Enter postal code"
                fullWidth
                error={Boolean(errors.postal_code)}
              />
              {errors.postal_code && <FormHelperText error>{errors.postal_code.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12} sm={4}>
              <InputLabel required>Start Date</InputLabel>
              <TextField
                {...register('start_date', { required: 'Start date is required' })}
                type="date"
                fullWidth
                  disabled={isEdit} 
                error={Boolean(errors.start_date)}
                helperText={errors.start_date?.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <InputLabel required>End Date</InputLabel>
              <TextField
                {...register('end_date', { required: 'End date is required' })}
                type="date"
                fullWidth
                error={Boolean(errors.end_date)}
                helperText={errors.end_date?.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {formError && <Typography color="error">{formError}</Typography>}

          <Button
            type="submit"
            variant="contained"
            disabled={isProcessing}
            sx={{ py: 1.5 }}
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isEdit ? 'Update Project' : 'Create Project'
            )}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
