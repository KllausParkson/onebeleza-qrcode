import type {
  QrCode,
  WelcomeScreen,
  CreateBaseQrCodePayload,
  CreateExclusiveQrCodePayload,
} from "@onebeleza/shared";

type QrCodeRaw = QrCode & {
  welcome_screens?: WelcomeScreen | WelcomeScreen[];
};

export function getWelcomeScreen(qr: QrCodeRaw): WelcomeScreen | undefined {
  if (qr.welcome_screen) return qr.welcome_screen;
  const ws = qr.welcome_screens;
  if (Array.isArray(ws)) return ws[0];
  return ws;
}

/** Normaliza resposta da API (welcome_screens → welcome_screen) */
export function normalizeQrCode(qr: QrCodeRaw): QrCode {
  const welcome_screen = getWelcomeScreen(qr);
  const { welcome_screens: _removed, ...rest } = qr;
  return { ...rest, welcome_screen } as QrCode;
}

export function mapBaseQrToForm(qr: QrCodeRaw): CreateBaseQrCodePayload {
  const ws = getWelcomeScreen(qr);
  return {
    name: qr.name,
    slug: qr.slug,
    folder_id: qr.folder_id ?? undefined,
    welcome: {
      color_primary: ws?.color_primary ?? "#22c55e",
      color_secondary: ws?.color_secondary ?? "#f0fdf4",
      logo_url: ws?.logo_url ?? undefined,
      welcome_image_url: ws?.welcome_image_url ?? undefined,
      title: ws?.title ?? undefined,
      description: ws?.description ?? undefined,
    },
  };
}

export function mapExclusiveQrToForm(qr: QrCodeRaw): CreateExclusiveQrCodePayload {
  const ws = getWelcomeScreen(qr);
  return {
    name: qr.name,
    slug: qr.slug,
    folder_id: qr.folder_id ?? undefined,
    welcome: {
      app_name: ws?.app_name ?? qr.name,
      developer: ws?.developer ?? undefined,
      logo_url: ws?.logo_url ?? undefined,
      title: ws?.title ?? undefined,
      description: ws?.description ?? undefined,
      website: ws?.website ?? undefined,
      color_primary: ws?.color_primary ?? "#1a1a1a",
      color_secondary: ws?.color_secondary ?? "#ffffff",
      welcome_image_url: ws?.welcome_image_url ?? undefined,
    },
    app_store_links:
      qr.app_store_links?.map((l) => ({ platform: l.platform, url: l.url })) ?? [
        { platform: "ios", url: "" },
        { platform: "android", url: "" },
      ],
    custom_buttons:
      qr.custom_buttons?.map((b, i) => ({
        label: b.label,
        url: b.url,
        order: b.order ?? i,
      })) ?? [],
  };
}
