import { supabase } from "./supabase.js";

export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from("qr_codes").select("id").eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data === null;
}

export async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let available = await isSlugAvailable(slug);
  if (available) return slug;

  let i = 2;
  while (!available) {
    slug = `${base}-${i}`;
    available = await isSlugAvailable(slug);
    i++;
    if (i > 100) throw new Error("Could not generate unique slug");
  }
  return slug;
}
