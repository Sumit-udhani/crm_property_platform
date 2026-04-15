'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

import authService from '@/services/auth.service';

export default function AuthForgotPassword() {
  const { enqueueSnackbar } = useSnackbar();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError]       = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (formData) => {
    setIsProcessing(true);
    setFormError('');

    try {
      const response = await authService.forgotPassword(formData.email);

      if (response.success) {
        enqueueSnackbar('Password reset email sent! Please check your inbox.', { variant: 'success' });
        reset();
      }

    } catch (error) {
      const message = error?.response?.data?.message || 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box>
        <InputLabel>Email Address</InputLabel>
        <OutlinedInput
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
          type="email"
          placeholder="Enter your email"
          fullWidth
          error={Boolean(errors.email)}
        />
        {errors.email?.message && (
          <FormHelperText error>{errors.email.message}</FormHelperText>
        )}
      </Box>

      <Button
        type="submit"
        color="primary"
        variant="contained"
        fullWidth
        disabled={isProcessing}
        endIcon={isProcessing && <CircularProgress color="secondary" size={16} />}
        sx={{ minWidth: 120, mt: { xs: 1, sm: 4 }, '& .MuiButton-endIcon': { ml: 1 } }}
      >
        Send Reset Link
      </Button>

      {formError && (
        <Alert sx={{ mt: 2 }} severity="error" variant="filled" icon={false}>
          {formError}
        </Alert>
      )}
    </form>
  );
}