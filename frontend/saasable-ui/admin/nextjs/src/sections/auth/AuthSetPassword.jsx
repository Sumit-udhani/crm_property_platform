'use client';
import PropTypes from 'prop-types';


import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';


import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import { APP_DEFAULT_PATH } from '@/config';

import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';


import authService from '@/services/auth.service';

import { IconEye, IconEyeOff } from '@tabler/icons-react';

export default function AuthSetPassword({ inputSx }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const token = searchParams.get('token') 

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const password = watch('password')

  const onSubmit = async (formData) => {
    setIsProcessing(true)
    setFormError('')

    if (!token) {
      setFormError('Invalid or missing token. Please use the link from your email.')
      setIsProcessing(false)
      return
    }

    try {
      const response = await authService.setPassword(token, formData.password, formData.confirmPassword)

      if (response.success) {
        
        localStorage.setItem('passwordSetSuccess', 'true')
        router.push(APP_DEFAULT_PATH)
      }

    } catch (error) {
      const message = error?.response?.data?.message || 'Something went wrong. Please try again.'
      setFormError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const commonIconProps = { size: 16, color: theme.vars.palette.grey[700] }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={2}>

        {/* Password */}
        <Box>
          <InputLabel>New Password</InputLabel>
          <OutlinedInput
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder="Enter new password"
            fullWidth
            error={Boolean(errors.password)}
            endAdornment={
              <InputAdornment
                position="end"
                sx={{ cursor: 'pointer' }}
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? <IconEye {...commonIconProps} /> : <IconEyeOff {...commonIconProps} />}
              </InputAdornment>
            }
            sx={inputSx}
          />
          {errors.password?.message && <FormHelperText error>{errors.password.message}</FormHelperText>}
        </Box>

        {/* Confirm Password */}
        <Box>
          <InputLabel>Confirm Password</InputLabel>
          <OutlinedInput
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match'
            })}
            type={isConfirmVisible ? 'text' : 'password'}
            placeholder="Confirm new password"
            fullWidth
            error={Boolean(errors.confirmPassword)}
            endAdornment={
              <InputAdornment
                position="end"
                sx={{ cursor: 'pointer' }}
                onClick={() => setIsConfirmVisible(!isConfirmVisible)}
              >
                {isConfirmVisible ? <IconEye {...commonIconProps} /> : <IconEyeOff {...commonIconProps} />}
              </InputAdornment>
            }
            sx={inputSx}
          />
          {errors.confirmPassword?.message && <FormHelperText error>{errors.confirmPassword.message}</FormHelperText>}
        </Box>

      </Stack>

      <Button
        type="submit"
        color="primary"
        variant="contained"
        fullWidth
        disabled={isProcessing}
        endIcon={isProcessing && <CircularProgress color="secondary" size={16} />}
        sx={{ minWidth: 120, mt: { xs: 1, sm: 4 }, '& .MuiButton-endIcon': { ml: 1 } }}
      >
        Set Password
      </Button>

      {formError && (
        <Alert sx={{ mt: 2 }} severity="error" variant="filled" icon={false}>
          {formError}
        </Alert>
      )}
    </form>
  )
}

AuthSetPassword.propTypes = { inputSx: PropTypes.any }