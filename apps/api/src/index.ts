import "dotenv/config";
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

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0] ?? "http://localhost:3000";
      return allowedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Rotas públicas (sem auth)
app.route("/public", publicRouter);

// Rotas autenticadas (OPTIONS passa direto para o CORS)
app.use("/api/*", async (c, next) => {
  if (c.req.method === "OPTIONS") return next();
  return authMiddleware(c, next);
});
app.route("/api/qrcodes", qrcodesRouter);
app.route("/api/folders", foldersRouter);
app.route("/api/upload", uploadRouter);

const port = parseInt(process.env.PORT ?? "3001");
console.log(`API running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export default app;
