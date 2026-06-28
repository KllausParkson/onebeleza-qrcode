import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";
import { normalizeQrCode } from "../lib/normalize-qrcode.js";

const app = new Hono();

/** GET /public/:slug — dados da welcome screen (sem auth) */
app.get("/:slug", async (c) => {
  const { slug } = c.req.param();
  const userAgent = c.req.header("user-agent") ?? "";
  const ip = c.req.header("x-forwarded-for") ?? "";

  const { data, error } = await supabase
    .from("qr_codes")
    .select(`*, welcome_screens(*), app_store_links(*), custom_buttons(*)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return c.json({ error: "Not found" }, 404);

  // Registra scan de forma assíncrona (não bloqueia resposta)
  supabase
    .from("scans")
    .insert({
      qr_code_id: data.id,
      user_agent: userAgent.slice(0, 500),
      country: null,
    })
    .then(() =>
      supabase.rpc("increment_scan_count", { qr_code_id_input: data.id })
    );

  return c.json(normalizeQrCode(data));
});

export default app;
