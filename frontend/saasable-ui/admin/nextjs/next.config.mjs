const isProd = process.env.NODE_ENV === 'production';

const apiHost = isProd
  ? 'http://k8s-default-crmprope-f9f9246cb9-baff2ed4a9c40657.elb.ap-south-1.amazonaws.com'
  : 'http://localhost:5000';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://flagcdn.com ${apiHost};
    font-src 'self';
    object-src 'self';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    connect-src 'self' https://cdn.jsdelivr.net ${apiHost};
`;

const nextConfig = {
  modularizeImports: {
    '@mui/material': { transform: '@mui/material/{{member}}' },
    '@mui/lab':      { transform: '@mui/lab/{{member}}' }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**'
      },
      {
        protocol: 'http',
        hostname: 'k8s-default-crmprope-f9f9246cb9-baff2ed4a9c40657.elb.ap-south-1.amazonaws.com',
        pathname: '**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',       
        port: '5000',
        pathname: '**'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, '')
          }
        ]
      }
    ];
  }
};

export default nextConfig;