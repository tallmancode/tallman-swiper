module.exports = {
  apps: [{
    name: 'swiper-staging',
    script: 'server-dist/index.js',
    cwd: process.env.APP_ROOT || '/www/wwwroot',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.APP_PORT || 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}

