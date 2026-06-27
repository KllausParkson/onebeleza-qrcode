import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { generateSlugFromName, isSlugAvailable, ensureUniqueSlug } from "../lib/slug.js";
import { generateQRCodeDataURL } from "../lib/qrcode.js";
import { ONE_BELEZA_LINKS } from "@onebeleza/shared";
import type { Variables } from "../index.js";

const app = new Hono<{ Variables: Variables }>();

const welcomeSchema = z.object({
  app_name: z.string().optional(),
  developer: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  title: z.string().optional(),
  description: z.string().max(250).optional(),
  website: z.string().url().optional().or(z.literal("")),
  color_primary: z.string().default("#1a1a1a"),
  color_secondary: z.string().default("#ffffff"),
  welcome_image_url: z.string().url().optional().or(z.literal("")),
});

const createBaseSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  folder_id: z.string().uuid().optional(),
  welcome: welcomeSchema,
});

const createExclusiveSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  folder_id: z.string().uuid().optional(),
  welcome: welcomeSchema.extend({ app_name: z.string().min(1) }),
  app_store_links: z
    .array(
      z.object({
        platform: z.enum(["ios", "android", "amazon"]),
        url: z.string().url(),
      })
    )
    .min(1),
  custom_buttons: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
        order: z.number().int().default(0),
      })
    )
    .optional(),
});

/** GET /qrcodes — lista QR Codes do usuário */
app.get("/", async (c) => {
  const userId = c.get("userId");
  const { type, folder_id, search, page = "1", limit = "20" } = c.req.query();

  let query = supabase
    .from("qr_codes")
    .select(
      `*, welcome_screens(*), app_store_links(*), custom_buttons(*)`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range((+page - 1) * +limit, +page * +limit - 1);

  if (type) query = query.eq("type", type);
  if (folder_id) query = query.eq("folder_id", folder_id);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error, count } = await query;
  if (error) return c.json({ error: error.message }, 500);

  return c.json({ data, total: count });
});

/** GET /qrcodes/:id */
app.get("/:id", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from("qr_codes")
    .select(`*, welcome_screens(*), app_store_links(*), custom_buttons(*)`)
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return c.json({ error: "Not found" }, 404);
  return c.json(data);
});

/** POST /qrcodes/base — cria APP Base */
app.post("/base", zValidator("json", createBaseSchema), async (c) => {
  const userId = c.get("userId");
  const body = c.req.valid("json");

  const slugBase = body.slug ?? generateSlugFromName(body.name);
  const slug = await ensureUniqueSlug(slugBase);

  const { data: qr, error: qrError } = await supabase
    .from("qr_codes")
    .insert({ name: body.name, slug, type: "base", user_id: userId, folder_id: body.folder_id ?? null })
    .select()
    .single();

  if (qrError) return c.json({ error: qrError.message }, 500);

  const [wsResult, linksResult] = await Promise.all([
    supabase.from("welcome_screens").insert({ qr_code_id: qr.id, ...body.welcome }),
    supabase.from("app_store_links").insert([
      { qr_code_id: qr.id, platform: "android", url: ONE_BELEZA_LINKS.android },
      { qr_code_id: qr.id, platform: "ios", url: ONE_BELEZA_LINKS.ios },
    ]),
  ]);

  if (wsResult.error) return c.json({ error: wsResult.error.message }, 500);
  if (linksResult.error) return c.json({ error: linksResult.error.message }, 500);

  return c.json({ ...qr, qr_data_url: await generateQRCodeDataURL(`${process.env.PUBLIC_URL}/${slug}`) }, 201);
});

/** POST /qrcodes/exclusive — cria APP Exclusivo */
app.post("/exclusive", zValidator("json", createExclusiveSchema), async (c) => {
  const userId = c.get("userId");
  const body = c.req.valid("json");

  const slugBase = body.slug ?? generateSlugFromName(body.name);
  const slug = await ensureUniqueSlug(slugBase);

  const { data: qr, error: qrError } = await supabase
    .from("qr_codes")
    .insert({ name: body.name, slug, type: "exclusive", user_id: userId, folder_id: body.folder_id ?? null })
    .select()
    .single();

  if (qrError) return c.json({ error: qrError.message }, 500);

  const ops: Promise<{ error: unknown }>[] = [
    supabase.from("welcome_screens").insert({ qr_code_id: qr.id, ...body.welcome }),
    supabase.from("app_store_links").insert(
      body.app_store_links.map((l) => ({ qr_code_id: qr.id, ...l }))
    ),
  ];

  if (body.custom_buttons?.length) {
    ops.push(
      supabase.from("custom_buttons").insert(
        body.custom_buttons.map((b) => ({ qr_code_id: qr.id, ...b }))
      )
    );
  }

  const results = await Promise.all(ops);
  for (const r of results) {
    if ((r as { error: { message: string } | null }).error) {
      return c.json({ error: (r as { error: { message: string } }).error.message }, 500);
    }
  }

  return c.json({ ...qr, qr_data_url: await generateQRCodeDataURL(`${process.env.PUBLIC_URL}/${slug}`) }, 201);
});

/** PUT /qrcodes/:id — atualiza QR Code */
app.put("/:id", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase
    .from("qr_codes")
    .select("id, slug, type")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!existing) return c.json({ error: "Not found" }, 404);

  if (body.slug && body.slug !== existing.slug) {
    const available = await isSlugAvailable(body.slug, id);
    if (!available) return c.json({ error: "Slug already in use" }, 409);
  }

  const { data: qr, error } = await supabase
    .from("qr_codes")
    .update({ name: body.name, slug: body.slug, folder_id: body.folder_id, is_active: body.is_active })
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);

  if (body.welcome) {
    await supabase.from("welcome_screens").update(body.welcome).eq("qr_code_id", id);
  }

  if (body.app_store_links && existing.type === "exclusive") {
    await supabase.from("app_store_links").delete().eq("qr_code_id", id);
    await supabase.from("app_store_links").insert(
      body.app_store_links.map((l: { platform: string; url: string }) => ({ qr_code_id: id, ...l }))
    );
  }

  return c.json(qr);
});

/** DELETE /qrcodes/:id */
app.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();

  const { error } = await supabase.from("qr_codes").delete().eq("id", id).eq("user_id", userId);
  if (error) return c.json({ error: error.message }, 500);

  return c.json({ success: true });
});

/** GET /qrcodes/:id/download?format=png|svg */
app.get("/:id/download", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();
  const format = c.req.query("format") ?? "png";

  const { data, error } = await supabase
    .from("qr_codes")
    .select("slug")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) return c.json({ error: "Not found" }, 404);

  const url = `${process.env.PUBLIC_URL}/${data.slug}`;

  if (format === "svg") {
    const { generateQRCodeSVG } = await import("../lib/qrcode.js");
    const svg = await generateQRCodeSVG(url);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${data.slug}.svg"`,
      },
    });
  }

  const { generateQRCodePNG } = await import("../lib/qrcode.js");
  const png = await generateQRCodePNG(url);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${data.slug}.png"`,
    },
  });
});

/** GET /qrcodes/slug/check?slug=... — verifica disponibilidade */
app.get("/slug/check", async (c) => {
  const slug = c.req.query("slug");
  if (!slug) return c.json({ error: "slug is required" }, 400);

  const available = await isSlugAvailable(slug);
  return c.json({ available, slug });
});

export default app;
