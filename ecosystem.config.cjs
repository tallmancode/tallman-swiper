module.exports = {
  apps: [{
    name: 'swiper',
    script: 'serve',
    env: {
      PM2_SERVE_PATH: '/www/wwwroot/swiper.tallmancode.co.za/dist',
      PM2_SERVE_PORT: 5191,
      PM2_SERVE_SPA: 'true',
      PM2_SERVE_HOMEPAGE: '/index.html'
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
