require('dotenv').config();
const path = require('path');

const appRoot = process.env.APP_ROOT || process.cwd();

module.exports = {
  apps: [{
    name: 'swiper-staging',
    script: path.join(appRoot, 'server-dist/index.js'),
    cwd: appRoot,
    env: {
      NODE_ENV: 'production',
      PORT: process.env.APP_PORT || 3000,
      PEXELS_API_KEY: process.env.PEXELS_API_KEY
    },
    error_file: path.join(appRoot, 'logs/err.log'),
    out_file: path.join(appRoot, 'logs/out.log'),
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}

