import { cache } from "react";
import type { QrCode } from "@onebeleza/shared";
import { normalizeQrCode } from "@/lib/qrcode-form";
import { createServiceClient } from "@/lib/supabase/service";

export const getPublicQrCodeBySlug = cache(async (slug: string): Promise<QrCode | null> => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("qr_codes")
    .select("*, welcome_screens(*), app_store_links(*), custom_buttons(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  return normalizeQrCode(data);
});

/** Registra scan de forma assíncrona (não bloqueia a resposta da página). */
export function recordQrCodeScan(qrCodeId: string, userAgent: string): void {
  const supabase = createServiceClient();

  void supabase
    .from("scans")
    .insert({
      qr_code_id: qrCodeId,
      user_agent: userAgent.slice(0, 500),
      country: null,
    })
    .then(() =>
      supabase.rpc("increment_scan_count", { qr_code_id_input: qrCodeId })
    );
}
