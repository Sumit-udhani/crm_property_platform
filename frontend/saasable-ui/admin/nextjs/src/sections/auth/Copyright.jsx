// @mui
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// @project
import branding from '@/branding.json';
import { NextLink } from '@/components/routes';

/***************************  AUTH - COPYRIGHT  ***************************/

export default function Copyright() {
  const copyrightSX = { display: { xs: 'none', sm: 'flex' } };
 const date = new Date().getFullYear();
  const linkProps = {
    component: NextLink,
    variant: 'caption',
    color: 'text.secondary',
    target: '_blank',
    underline: 'hover',
    sx: { '&:hover': { color: 'primary.main' } }
  };

  return (
    <Stack sx={{ gap: 1, width: 'fit-content', mx: 'auto' }}>
      <Stack direction="row" sx={{ justifyContent: 'center', gap: { xs: 1, sm: 1.5 }, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={copyrightSX}>
          © {date} {branding.brandName}
        </Typography>
        <Divider orientation="vertical" flexItem sx={copyrightSX} />
       
        <Divider orientation="vertical" flexItem />
       
      </Stack>

      <Box sx={{ textAlign: 'center', display: { xs: 'block', sm: 'none' } }}>
        <Divider sx={{ marginBottom: 1 }} />
        <Typography variant="caption" color="text.secondary">
          © 2026 {branding.brandName}
        </Typography>
      </Box>
    </Stack>
  );
}
