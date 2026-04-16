'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import { IconCamera } from '@tabler/icons-react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { IconChevronRight } from '@tabler/icons-react';
import authService from '@/services/auth.service';
import { useRouter } from 'next/navigation';


export default function EditProfileView() {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
const router = useRouter();
  const [profileData, setProfileData]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile]       = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError]       = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getMe();
        if (res.success) {
          setProfileData(res.data);
          setImagePreview(res.data.profile_image || null);
          reset({
            first_name: res.data.first_name || '',
            last_name:  res.data.last_name  || '',
            phone:      res.data.phone      || '',
          });
        }
      } catch {
        enqueueSnackbar('Failed to load profile', { variant: 'error' });
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setFormError('');
    try {
      const formData = new FormData();
      formData.append('first_name', data.first_name);
      formData.append('last_name',  data.last_name  || '');
      formData.append('phone',      data.phone      || '');
      if (imageFile) formData.append('profile_image', imageFile);

      const res = await authService.updateMe(formData);
      if (res.success) {
        enqueueSnackbar('Profile updated successfully', { variant: 'success' });
        setProfileData(res.data);
        setImagePreview(res.data.profile_image || null);
        setImageFile(null);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Something went wrong.';
      setFormError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
         <Breadcrumbs
      separator={<IconChevronRight size={14} />}
      sx={{ mb: 2 }}
    >
      <Link
        underline="hover"
        color="text.secondary"
        sx={{ cursor: 'pointer', fontSize: 13 }}
        onClick={() => router.push('/dashboard')}
      >
        Dashboard
      </Link>
      <Typography color="text.primary" sx={{ fontSize: 13 }}>
        Settings
      </Typography>
    </Breadcrumbs>
      <Typography variant="h3" sx={{ mb: 3 }}>Edit Profile</Typography>

      {/* Avatar Upload */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={imagePreview || '/assets/images/users/avatar-1.png'}
            alt="Profile"
            sx={{ width: 88, height: 88, fontSize: 32 }}
          />
          <IconButton
            size="small"
            onClick={() => fileInputRef.current.click()}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'white',
              width: 28,
              height: 28,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <IconCamera size={15} />
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {profileData.first_name} {profileData.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {profileData.role_name}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.3 }}>
            JPG, PNG or WebP — max 2MB
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2.5}>

          <Box>
            <InputLabel required>First Name</InputLabel>
            <OutlinedInput
              {...register('first_name', { required: 'First name is required' })}
              fullWidth
              placeholder="Enter first name"
              error={Boolean(errors.first_name)}
            />
            {errors.first_name && <FormHelperText error>{errors.first_name.message}</FormHelperText>}
          </Box>

          <Box>
            <InputLabel>Last Name</InputLabel>
            <OutlinedInput
              {...register('last_name')}
              fullWidth
              placeholder="Enter last name"
            />
          </Box>

          <Box>
            <InputLabel>Phone</InputLabel>
            <OutlinedInput
              {...register('phone')}
              fullWidth
              placeholder="Enter phone number"
            />
          </Box>

          {/* Read-only fields */}
          <Box>
            <InputLabel>Email</InputLabel>
            <OutlinedInput
              fullWidth
              value={profileData.email || ''}
              disabled
            />
          </Box>

          <Box>
            <InputLabel>Role</InputLabel>
            <OutlinedInput
              fullWidth
              value={profileData.role_name || ''}
              disabled
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
            endIcon={isProcessing && <CircularProgress size={16} color="inherit" />}
            sx={{ alignSelf: 'flex-start', minWidth: 160 }}
          >
            Save Changes
          </Button>

        </Stack>
      </form>
    </Box>
  );
}