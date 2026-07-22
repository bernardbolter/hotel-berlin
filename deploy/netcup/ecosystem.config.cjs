/**
 * PM2 process file for Netcup (or any VPS).
 *
 * From the app root:
 *   npm run build
 *   pm2 start deploy/netcup/ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'hotel-berlin',
      cwd: '/var/www/hotel-berlin', // change if your clone path differs
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
