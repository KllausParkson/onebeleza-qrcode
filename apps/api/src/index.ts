import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware } from "./middleware/auth.js";
import qrcodesRouter from "./routes/qrcodes.js";
import foldersRouter from "./routes/folders.js";
import publicRouter from "./routes/public.js";
import uploadRouter from "./routes/upload.js";

export type Variables = {
  userId: string;
};

const app = new Hono<{ Variables: Variables }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Rotas públicas (sem auth)
app.route("/public", publicRouter);

// Rotas autenticadas
app.use("/api/*", authMiddleware);
app.route("/api/qrcodes", qrcodesRouter);
app.route("/api/folders", foldersRouter);
app.route("/api/upload", uploadRouter);

const port = parseInt(process.env.PORT ?? "3001");
console.log(`API running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export default app;
