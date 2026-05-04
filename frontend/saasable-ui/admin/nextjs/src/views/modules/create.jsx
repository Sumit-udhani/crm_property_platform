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
import { IconArrowLeft } from '@tabler/icons-react';

import moduleService from '@/services/module.service';

export default function CreateModuleView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const { enqueueSnackbar } = useSnackbar();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      parent_id: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await moduleService.getModules();
        setModules(res.data || []);

        if (isEdit) {
          // Flatten tree to find the module if needed, but getModules currently returns all with children
          // Let's find the module to edit
          const findModule = (list, id) => {
            for (let m of list) {
              if (String(m.id) === String(id)) return m;
              if (m.children) {
                const found = findModule(m.children, id);
                if (found) return found;
              }
            }
            return null;
          };

          const moduleToEdit = findModule(res.data || [], editId);
          if (moduleToEdit) {
            reset({
              name: moduleToEdit.name,
              parent_id: moduleToEdit.parent_id ? String(moduleToEdit.parent_id) : ''
            });
          }
        }
      } catch {
        enqueueSnackbar('Failed to load data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [editId, isEdit, reset, enqueueSnackbar]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setFormError('');
    try {
      const payload = {
        name: data.name,
        parent_id: data.parent_id || null
      };

      if (isEdit) {
        await moduleService.editModule(editId, payload);
        enqueueSnackbar('Module updated successfully!', { variant: 'success' });
      } else {
        await moduleService.createModule(payload);
        enqueueSnackbar('Module created successfully!', { variant: 'success' });
      }
      router.push('/dashboard/permissions');
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
          onClick={() => router.push('/dashboard/permissions')}
          sx={{ minWidth: 0 }}
        >
          Back
        </Button>
        <Typography variant="h3">{isEdit ? 'Edit Module' : 'Create Module'}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2.5}>
          <Box>
            <InputLabel required>Module Name</InputLabel>
            <OutlinedInput
              {...register('name', { required: 'Module name is required' })}
              placeholder="Enter module name (e.g. users, projects)"
              fullWidth
              error={Boolean(errors.name)}
            />
            {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
          </Box>

          <Box>
            <InputLabel>Parent Module (Optional)</InputLabel>
            <Controller
              name="parent_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  displayEmpty
                  disabled={loading}
                  input={<OutlinedInput />}
                >
                  <MenuItem value="">None (Top-level Module)</MenuItem>
                  {modules
                    .filter(m => !m.parent_id && String(m.id) !== String(editId))
                    .map((m) => (
                      <MenuItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
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
            {isEdit ? 'Update Module' : 'Create Module'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
