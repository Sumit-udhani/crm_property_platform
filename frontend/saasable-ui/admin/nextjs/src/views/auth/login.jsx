// @mui
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// @project
import { NextLink } from '@/components/routes';
import AuthLogin from '@/sections/auth/AuthLogin';
// import AuthSocial from '@/sections/auth/AuthSocial';
import Copyright from '@/sections/auth/Copyright';

export default function Login() {
  return (
  <Stack
  sx={{
    minHeight: '100vh', 
    alignItems: 'center',
    justifyContent: 'center', 
    px: 2,
  }}
>
  <Box sx={{ width: '100%', maxWidth: 458 }}>
    
    <Stack
      sx={{
        gap: { xs: 1, sm: 1.5 },
        textAlign: 'center',
        mb: 4,
      }}
    >
      <Typography variant="h1">Sign In</Typography>
      <Typography variant="body1" color="text.secondary">
        Welcome back! login to continue.
      </Typography>
    </Stack>

    <AuthLogin />

    
    <Box sx={{ mt: 4 }}>
      <Copyright />
    </Box>

  </Box>
</Stack>
  );
}
