import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
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

const app = express();
const client = apiKey ? createClient(apiKey) : null;

app.get("/api/photos", async (_req: Request, res: Response) => {
  if (!client) {
    res.status(500).json({ error: "Server missing PEXELS_API_KEY" });
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
      const photos: IPhoto[] = result.photos.map((photo) => ({
        id: String(photo.id),
        src: photo.src.portrait,
        credits: {
          name: photo.photographer,
          link: photo.photographer_url,
        },
      }));

      res.json(photos);
      return;
    }

    const error = (result as { error?: string }).error ?? "Unknown Pexels error";
    res.status(502).json({ error });
  } catch (err) {
    console.error("Pexels request failed", err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

async function bootstrap() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
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
    app.get("*", (_req, res) => {
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

