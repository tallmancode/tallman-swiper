# Deployment Guide

## Required GitHub Secrets

Before deploying this application, you must configure the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### Required Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `PEXELS_API_KEY` | Your Pexels API key for fetching photos | ✅ Yes |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking (optional) | ⚠️ Optional |
| `SSH_KEY` | SSH private key for server access | ✅ Yes |
| `USERNAME` | SSH username for server | ✅ Yes |
| `HOST` | Server hostname or IP address | ✅ Yes |
| `SERVER_PATH` | Absolute path to deployment directory on server | ✅ Yes |

### Setting Up PEXELS_API_KEY

1. Visit [pexels.com/api](https://www.pexels.com/api/)
2. Sign up or log in to your account
3. Navigate to your API dashboard
4. Copy your API key
5. Add it as a GitHub secret named `PEXELS_API_KEY`

**Important**: This is different from the old `VITE_PEXEL_KEY` secret. The new architecture uses a backend proxy server to protect the API key from client-side exposure.

### Migration Note

If you previously used `VITE_PEXEL_KEY`, you should:
1. Add the new `PEXELS_API_KEY` secret (same value)
2. The old `VITE_PEXEL_KEY` secret is no longer used and can be removed

## Deployment Process

The deployment workflow (`.github/workflows/deploy.yml`) performs the following steps:

1. **Build Frontend**: Compiles the Vue application (`npm run build`)
2. **Build Backend**: Compiles the TypeScript server (`npm run build:server`)
3. **Archive**: Creates `build.tar.gz` containing:
   - `dist/` - Frontend build artifacts
   - `server-dist/` - Compiled Node.js server
   - `ecosystem.config.cjs` - PM2 configuration
4. **Transfer**: Uploads archive to server via SCP
5. **Deploy**: 
   - Extracts build artifacts
   - Creates `.env` file with `PEXELS_API_KEY` (permissions: 600)
   - Stops existing PM2 process
   - Starts/reloads PM2 with new code
   - Performs health check on port

## Server Requirements

### Prerequisites

- **Node.js** 18.0 or higher
- **PM2** installed globally (`npm install -g pm2`)
- **Deployment directory** must exist at the path specified in `SERVER_PATH`
- **Port 3000** available for the application

### Directory Structure on Server

```
/www/wwwroot/swiper/
├── dist/                    # Frontend static files
├── server-dist/             # Compiled Node.js server
├── ecosystem.config.cjs     # PM2 configuration
├── .env                     # Environment variables (created during deployment)
└── logs/                    # Application logs
    ├── err.log
    └── out.log
```

### Environment Variables

The server expects the following environment variables:

- `NODE_ENV=production` (set by PM2 ecosystem config)
- `PORT=3000` (set by PM2 ecosystem config)
- `PEXELS_API_KEY` (loaded from `.env` file via dotenv)

## Manual Deployment

If you need to deploy manually:

```bash
# 1. Build locally
npm run build
npm run build:server

# 2. Archive
tar -czvf build.tar.gz ./dist ./server-dist ./ecosystem.config.cjs

# 3. Transfer to server
scp build.tar.gz user@server:/path/to/deployment/

# 4. SSH to server
ssh user@server
cd /path/to/deployment/

# 5. Extract
tar -xzvf build.tar.gz
rm build.tar.gz

# 6. Create .env file
echo "PEXELS_API_KEY=your_api_key_here" > .env
chmod 600 .env

# 7. Deploy with PM2
pm2 stop swiper || true
pm2 start ecosystem.config.cjs
pm2 save

# 8. Verify
curl http://localhost:5191
```

## Troubleshooting

### Health Check Failing

If the health check fails during deployment:

1. SSH to the server
2. Check PM2 logs: `pm2 logs swiper`
3. Verify `.env` file exists and contains `PEXELS_API_KEY`
4. Ensure Node.js version is 18.0 or higher
5. Check if port 5191 is available: `lsof -i :5191`

### API Key Issues

If you see "Server missing PEXELS_API_KEY" errors:

1. Verify the GitHub secret `PEXELS_API_KEY` is set
2. Check that `.env` file was created during deployment
3. Verify `.env` file permissions: `ls -la .env` (should be -rw-------)
4. Ensure dotenv is properly loading: Check server logs

### PM2 Issues

```bash
# View all PM2 processes
pm2 list

# View logs
pm2 logs swiper

# Restart process
pm2 restart swiper

# Delete and recreate
pm2 delete swiper
pm2 start ecosystem.config.cjs
pm2 save
```

## Security Notes

- The `.env` file is created with restrictive permissions (600) to protect the API key
- The API key is never exposed to the client-side code
- All API calls to Pexels go through the backend proxy at `/api/photos`
- Ensure your server has proper firewall rules and only exposes necessary ports

