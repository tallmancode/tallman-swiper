# Deployment

Tallman Swiper deploys with **Docker Compose** on a VPS. Images are built in GitHub Actions and pushed to **GHCR**.

**Production:** [https://swiper.tallmancode.co.za](https://swiper.tallmancode.co.za)

```text
develop → promote staging → promote main → cut release vX.Y.Z → deploy
```

| Workflow | Role |
| -------- | ---- |
| CI | Typecheck, build, dependency audit |
| Promote to staging | Fast-forward `staging` ← `develop` (quality gate only) |
| Promote to main | Fast-forward `main` ← `staging` |
| Cut release | Annotated tag + GitHub Release |
| Deploy | Build/push GHCR image; SSH `docker compose pull && up -d` |

Full one-time VPS + GitHub setup: **[docs/deploy-vps.md](docs/deploy-vps.md)**.

### Secrets (GitHub environment `production`)

- Required: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_COMPOSE_DIR`
- Optional: `VPS_PORT` (default 22), `VITE_SENTRY_DSN`

`PEXELS_API_KEY` is set on the VPS in `.env` next to `docker-compose.yml` (see [`deploy/.env.example`](deploy/.env.example)).
