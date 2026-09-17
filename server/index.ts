import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createClient } from "pexels";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { IPhoto } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 5173;
const isProd = process.env.NODE_ENV === "production";
const apiKey = process.env.PEXELS_API_KEY;
const CACHE_TTL_MS = 60 * 60 * 1000;

if (isProd && !apiKey) {
  console.error("PEXELS_API_KEY is required in production");
  process.exit(1);
}

const app = express();
const client = apiKey ? createClient(apiKey) : null;

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: isProd
      ? {
          useDefaults: true,
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://images.pexels.com"],
            connectSrc: [
              "'self'",
              "https://*.ingest.sentry.io",
              "https://*.ingest.de.sentry.io",
            ],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  })
);

function isAllowedPexelsUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host === "pexels.com" || host.endsWith(".pexels.com");
  } catch {
    return false;
  }
}

function mapPhotos(
  photos: Array<{
    id: number | string;
    src?: { portrait?: string };
    photographer?: string;
    photographer_url?: string;
  }>
): IPhoto[] {
  const mapped: IPhoto[] = [];
  for (const photo of photos) {
    const src = photo.src?.portrait;
    if (!isAllowedPexelsUrl(src)) continue;
    const link = isAllowedPexelsUrl(photo.photographer_url)
      ? photo.photographer_url
      : "https://www.pexels.com";
    mapped.push({
      id: String(photo.id),
      src,
      credits: {
        name: photo.photographer ?? "Unknown",
        link,
      },
    });
  }
  return mapped;
}

type PhotosCache = { expiresAt: number; photos: IPhoto[] };
let photosCache: PhotosCache | null = null;

const photosRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get(
  "/api/photos",
  photosRateLimiter,
  async (_req: Request, res: Response) => {
    if (!client) {
      res.status(500).json({ error: "Photo service unavailable" });
      return;
    }

    if (photosCache && photosCache.expiresAt > Date.now()) {
      res.json(photosCache.photos);
      return;
    }

    try {
      const result = await client.photos.search({
        query: "people",
        orientation: "portrait",
        size: "small",
        page: 1,
        per_page: 40,
      });

      if ("photos" in result) {
        const photos = mapPhotos(result.photos);
        photosCache = {
          expiresAt: Date.now() + CACHE_TTL_MS,
          photos,
        };
        res.json(photos);
        return;
      }

      console.error("Pexels search returned an error payload");
      res.status(502).json({ error: "Upstream photo service failed" });
    } catch (err) {
      console.error("Pexels request failed", err);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  }
);

async function bootstrap() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);

    app.use("/{*path}", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const indexHtml = await fs.readFile(
          path.resolve(__dirname, "../index.html"),
          "utf-8"
        );
        const transformed = await vite.transformIndexHtml(url, indexHtml);
        res
          .status(200)
          .set({ "Content-Type": "text/html" })
          .end(transformed);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, "../dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
