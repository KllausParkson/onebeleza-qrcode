import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";
import type { Variables } from "../index.js";

const app = new Hono<{ Variables: Variables }>();

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

app.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file || typeof file === "string") {
    return c.json({ error: "No file provided" }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }, 400);
  }

  if (file.size > MAX_SIZE_BYTES) {
    return c.json({ error: "File too large. Max 5MB" }, 400);
  }

  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${userId}/${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { data, error } = await supabase.storage
    .from("qrcode-assets")
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return c.json({ error: error.message }, 500);

  const { data: publicUrl } = supabase.storage
    .from("qrcode-assets")
    .getPublicUrl(data.path);

  return c.json({ url: publicUrl.publicUrl }, 201);
});

export default app;
