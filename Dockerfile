# syntax=docker/dockerfile:1

FROM node:25.2.1-alpine3.21 AS builder

WORKDIR /app

ARG VITE_SENTRY_DSN=
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

ARG VITE_SENTRY_ENV=production
ENV VITE_SENTRY_ENV=$VITE_SENTRY_ENV

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.node.json tsconfig.server.json ./
COPY public ./public
COPY src ./src
COPY server ./server

RUN npm run build && npm run build:server

FROM node:25.2.1-alpine3.21 AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S swiper && adduser -S swiper -G swiper \
  && apk add --no-cache wget

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder --chown=swiper:swiper /app/dist ./dist
COPY --from=builder --chown=swiper:swiper /app/server-dist ./server-dist

USER swiper

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=15s \
  CMD wget --no-verbose --spider http://127.0.0.1:3000/health || exit 1

CMD ["node", "server-dist/index.js"]
