'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

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

import buildingService from '@/services/building.service';
import projectService from '@/services/project.service';
import locationService from '@/services/location.service';

export default function CreateBuildingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const { enqueueSnackbar } = useSnackbar();

  const [projects, setProjects] = useState([]);
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      project_id: '',
      building_type_id: '',
      name: '',
      code: '',
      total_floors: '',
      total_units: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    }
  });

  const selectedCountry = watch('country');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [projectsRes, typesRes, countriesRes] = await Promise.all([
          projectService.getProjects(),
          buildingService.getBuildingTypes(),
          locationService.getCountries()
        ]);
        setProjects(projectsRes.data || []);
        setBuildingTypes(typesRes.data || []);
        setCountries(countriesRes.data || []);
        
        if (isEdit) {
          fetchBuildingDetails();
        } else {
          setLoading(false);
        }
      } catch (error) {
        enqueueSnackbar('Failed to load initial data', { variant: 'error' });
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [isEdit]);

  const fetchBuildingDetails = async () => {
    try {
      const res = await buildingService.getBuildings();
      const building = (res.data || []).find(b => String(b.id) === String(editId));
      if (building) {
       if (building.country_id) {
  const stateRes = await locationService.getStates(building.country_id);
  setStates(stateRes.data || []);
}

        reset({
          project_id: String(building.project_id),
         building_type_id: building.building_type_id
    ? String(building.building_type_id)
    : '',
          name: building.name,
          code: building.code,
          total_floors: building.total_floors,
          total_units: building.total_units,
          address_line_1: building.address,
          address_line_2: '',
          country: building.country_id || '',
          state:        building.state_id || '',
           city: building.city || '',
          postal_code: building.postal_code,
        });
      }
    } catch (error) {
      enqueueSnackbar('Failed to load building details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStates = async () => {
      if (selectedCountry) {
        try {
          const res = await locationService.getStates(selectedCountry);
          setStates(res.data || []);
        } catch {
          enqueueSnackbar('Failed to load states', { variant: 'error' });
        }
      } else {
        setStates([]);
        setValue('state', '');
      }
    };
    if (!loading) fetchStates();
  }, [selectedCountry, setValue, enqueueSnackbar]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setFormError('');
    try {
      if (isEdit) {
        await buildingService.updateBuilding(editId, data);
        sessionStorage.setItem('buildingUpdated', 'true');
      } else {
        await buildingService.createBuilding(data);
        sessionStorage.setItem('buildingCreated', 'true');
      }
      router.push('/dashboard/buildings');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Something went wrong. Please try again.';
      setFormError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
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
          onClick={() => router.push('/dashboard/buildings')}
          sx={{ minWidth: 0 }}
        >
          Back
        </Button>
        <Typography variant="h3">{isEdit ? 'Edit Building' : 'Add Building'}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <InputLabel required>Project</InputLabel>
            <Controller
              name="project_id"
              control={control}
              rules={{ required: 'Project is required' }}
              render={({ field }) => (
                <Select {...field} fullWidth displayEmpty error={Boolean(errors.project_id)}>
                  <MenuItem value="" disabled>Select Project</MenuItem>
                  {projects.map((p) => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
                </Select>
              )}
            />
            {errors.project_id && <FormHelperText error>{errors.project_id.message}</FormHelperText>}
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel required>Building Type</InputLabel>
            <Controller
              name="building_type_id"
              control={control}
              rules={{ required: 'Building type is required' }}
              render={({ field }) => (
                <Select {...field} fullWidth displayEmpty error={Boolean(errors.building_type_id)}>
                  <MenuItem value="" disabled>Select Type</MenuItem>
                  {buildingTypes.map((t) => <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>)}
                </Select>
              )}
            />
            {errors.building_type_id && <FormHelperText error>{errors.building_type_id.message}</FormHelperText>}
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel required>Building Name</InputLabel>
            <OutlinedInput
              {...register('name', { required: 'Name is required' })}
              placeholder="Enter building name"
              fullWidth
              error={Boolean(errors.name)}
            />
            {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
          </Grid>

        

          <Grid item xs={12} sm={6}>
            <InputLabel required>Total Floors</InputLabel>
            <OutlinedInput
              {...register('total_floors', { required: 'Floors required', min: 0 })}
              type="number"
              placeholder="0"
              fullWidth
              error={Boolean(errors.total_floors)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel required>Total Units</InputLabel>
            <OutlinedInput
              {...register('total_units', { required: 'Units required', min: 0 })}
              type="number"
              placeholder="0"
              fullWidth
              error={Boolean(errors.total_units)}
            />
          </Grid>

          <Grid item xs={12}>
            <InputLabel required>Address Line 1</InputLabel>
            <OutlinedInput
              {...register('address_line_1', { required: 'Address required' })}
              placeholder="Enter address"
              fullWidth
              error={Boolean(errors.address_line_1)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel required>Country</InputLabel>
            <Controller
              name="country"
              control={control}
              rules={{ required: 'Country required' }}
              render={({ field }) => (
                <Select {...field} fullWidth displayEmpty error={Boolean(errors.country)}>
                  <MenuItem value="" disabled>Select Country</MenuItem>
                  {countries.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
                </Select>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel required>State</InputLabel>
            <Controller
              name="state"
              control={control}
              rules={{ required: 'State required' }}
              render={({ field }) => (
                <Select 
                  {...field} 
                  fullWidth 
                  displayEmpty 
                  disabled={!selectedCountry}
                  error={Boolean(errors.state)}
                >
                  <MenuItem value="" disabled>Select State</MenuItem>
                  {states.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>)}
                </Select>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel required>City</InputLabel>
            <OutlinedInput
              {...register('city', { required: 'City required' })}
              placeholder="Enter city"
              fullWidth
              error={Boolean(errors.city)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel required>Postal Code</InputLabel>
            <OutlinedInput
              {...register('postal_code', { required: 'Postal code required' })}
              placeholder="Enter postal code"
              fullWidth
              error={Boolean(errors.postal_code)}
            />
          </Grid>

          {formError && (
            <Grid item xs={12}>
              <Alert severity="error">{formError}</Alert>
            </Grid>
          )}
        </Grid>
        <Button
              type="submit"
              variant="contained"
              disabled={isProcessing}
              endIcon={isProcessing && <CircularProgress color="secondary" size={16} />}
                     sx={{ alignSelf: 'flex-start', minWidth: 200, marginTop:3}}
            >
              {isEdit ? 'Update Building' : 'Create Building'}
            </Button>
      </form>
    </Box>
  );
}
