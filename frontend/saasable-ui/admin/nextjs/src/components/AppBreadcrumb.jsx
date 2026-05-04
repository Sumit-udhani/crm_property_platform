'use client';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { IconChevronRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function AppBreadcrumb({ items = [] }) {
  const router = useRouter();

  return (
    <Breadcrumbs
      separator={<IconChevronRight size={14} />}
      sx={{ mb: 2 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <Typography key={index} color="text.primary" sx={{ fontSize: 13 }}>
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={index}
            underline="hover"
            color="text.secondary"
            sx={{ cursor: 'pointer', fontSize: 13 }}
            onClick={() => router.push(item.path)}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}