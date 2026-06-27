import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import type { Variables } from "../index.js";

const app = new Hono<{ Variables: Variables }>();

app.get("/", async (c) => {
  const userId = c.get("userId");
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.post(
  "/",
  zValidator("json", z.object({ name: z.string().min(1) })),
  async (c) => {
    const userId = c.get("userId");
    const { name } = c.req.valid("json");

    const { data, error } = await supabase
      .from("folders")
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data, 201);
  }
);

app.put(
  "/:id",
  zValidator("json", z.object({ name: z.string().min(1) })),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    const { name } = c.req.valid("json");

    const { data, error } = await supabase
      .from("folders")
      .update({ name })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
  }
);

app.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();

  await supabase
    .from("qr_codes")
    .update({ folder_id: null })
    .eq("folder_id", id)
    .eq("user_id", userId);

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

export default app;
