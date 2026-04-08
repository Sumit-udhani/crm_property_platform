'use client';
import PropTypes from 'prop-types';

// @next
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// @third-party
import { useForm } from 'react-hook-form';

// @project
import { APP_DEFAULT_PATH } from '@/config';
import { emailSchema, passwordSchema } from '@/utils/validation-schema/common';
import authService from '@/services/auth.service';

// @icons
import { IconEye, IconEyeOff } from '@tabler/icons-react';

/***************************  AUTH - LOGIN  ***************************/

export default function AuthLogin({ inputSx }) {
  const router = useRouter();
  const theme = useTheme();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { email: '', password: '' } });

  // ─── Handle Login ───
 const onSubmit = async (formData) => {
  setIsProcessing(true);
  setLoginError('');

  try {
    const response = await authService.login(formData.email, formData.password)

    if (response.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userId', response.data.userId)

      
      document.cookie = `token=${response.data.token}; path=/; max-age=86400`

      
      router.push('/dashboard')
    }

  } catch (error) {
    const message = error?.response?.data?.message || 'Login failed. Please try again.'
    setLoginError(message)
  } finally {
    setIsProcessing(false)
  }
};
  const commonIconProps = { size: 16, color: theme.vars.palette.grey[700] };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <Box>
            <InputLabel>Email</InputLabel>
            <OutlinedInput
              {...register('email', emailSchema)}
              placeholder="example@domain.com"
              fullWidth
              error={Boolean(errors.email)}
              sx={inputSx}
            />
            {errors.email?.message && <FormHelperText error>{errors.email.message}</FormHelperText>}
          </Box>

          <Box>
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              {...register('password', passwordSchema)}
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="Enter your password"
              fullWidth
              error={Boolean(errors.password)}
              endAdornment={
                <InputAdornment
                  position="end"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible
                    ? <IconEye {...commonIconProps} />
                    : <IconEyeOff {...commonIconProps} />}
                </InputAdornment>
              }
              sx={inputSx}
            />
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: errors.password ? 'space-between' : 'flex-end', width: 1 }}
            >
              {errors.password?.message && <FormHelperText error>{errors.password.message}</FormHelperText>}
              <Link
                underline="hover"
                variant="caption"
                href="#"
                textAlign="right"
                sx={{ '&:hover': { color: 'primary.dark' }, mt: 0.75 }}
              >
                Forgot Password?
              </Link>
            </Stack>
          </Box>
        </Stack>

        <Button
          type="submit"
          color="primary"
          variant="contained"
          disabled={isProcessing}
          endIcon={isProcessing && <CircularProgress color="secondary" size={16} />}
          sx={{ minWidth: 120, mt: { xs: 1, sm: 4 }, '& .MuiButton-endIcon': { ml: 1 } }}
        >
          Sign In
        </Button>

        {loginError && (
          <Alert sx={{ mt: 2 }} severity="error" variant="filled" icon={false}>
            {loginError}
          </Alert>
        )}
      </form>
    </>
  );
}

AuthLogin.propTypes = { inputSx: PropTypes.any };