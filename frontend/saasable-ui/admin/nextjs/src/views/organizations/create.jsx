'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { IconArrowLeft } from '@tabler/icons-react';

import organizationService from '@/services/organization.service';

export default function CreateOrganizationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const { enqueueSnackbar } = useSnackbar();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!isEdit) return;

    const fetchOrg = async () => {
      try {
        const res = await organizationService.getOrganizations();
        const org = (res.data || []).find((o) => String(o.id) === String(editId));
        if (org) {
          reset({
            name: org.name || '',
          });
        }
      } catch (error) {
        enqueueSnackbar('Failed to load organization details', { variant: 'error' });
      }
    };
    fetchOrg();
  }, [isEdit, editId, reset, enqueueSnackbar]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setFormError('');
    try {
      if (isEdit) {
        await organizationService.editOrganization(editId, data);
        sessionStorage.setItem('orgUpdated', 'true');
      } else {
        await organizationService.createOrganization(data);
        sessionStorage.setItem('orgCreated', 'true');
      }
      router.push('/dashboard/organizations');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Something went wrong. Please try again.';
      setFormError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      {/* Back + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          variant="text"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push('/dashboard/organizations')}
          sx={{ minWidth: 0 }}
        >
          Back
        </Button>
        <Typography variant="h3">{isEdit ? 'Edit Organization' : 'Create Organization'}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2.5}>
          <Box>
            <InputLabel required>Organization Name</InputLabel>
            <OutlinedInput
              {...register('name', { required: 'Organization name is required' })}
              placeholder="Enter organization name"
              fullWidth
              error={Boolean(errors.name)}
            />
            {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
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
            sx={{ alignSelf: 'flex-start', minWidth: 200 }}
          >
            {isEdit ? 'Update Organization' : 'Create Organization'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}