'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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

import roleService from '@/services/role.service';

export default function CreateRoleView() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const editId       = searchParams.get('id');
  const isEdit       = Boolean(editId);
  const { enqueueSnackbar } = useSnackbar();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError]       = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

 
  useEffect(() => {
    if (!isEdit) return;

    const fetchRole = async () => {
      try {
        const res = await roleService.getRoles();
        const role = (res.data || []).find((r) => String(r.id) === String(editId));
        if (role) {
              reset({ 
        name: role.name,

      });
        }
      } catch {
        enqueueSnackbar('Failed to load role details', { variant: 'error' });
      }
    };
    fetchRole();
  }, [isEdit, editId]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setFormError('');
    try {
      if (isEdit) {
        await roleService.editRole(editId, data);
        sessionStorage.setItem('roleUpdated', 'true');
      } else {
        await roleService.createRole(data);
        sessionStorage.setItem('roleCreated', 'true');
      }
      router.push('/dashboard/roles');
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
          onClick={() => router.push('/dashboard/roles')}
          sx={{ minWidth: 0 }}
        >
          Back
        </Button>
        <Typography variant="h3">{isEdit ? 'Edit Role' : 'Create Role'}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2.5}>
          <Box>
            <InputLabel required>Role Name</InputLabel>
            <OutlinedInput
              {...register('name', { required: 'Role name is required' })}
              placeholder="Enter role name"
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
            sx={{ alignSelf: 'flex-start', minWidth: 160 }}
          >
            {isEdit ? 'Update Role' : 'Create Role'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}