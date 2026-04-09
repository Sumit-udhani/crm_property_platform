// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';


import AuthSetPassword from '@/sections/auth/AuthSetPassword';

export default function SetPassword() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: 1, maxWidth: 458, px: 2 }}>
        <Stack sx={{ gap: { xs: 1, sm: 1.5 }, textAlign: 'center', mb: { xs: 3, sm: 5 } }}>
          <Typography variant="h1">Set Password</Typography>
          <Typography variant="body1" color="text.secondary">
            Create a strong password for your account.
          </Typography>
        </Stack>

        <AuthSetPassword />
      </Box>
    </Box>
  )
}