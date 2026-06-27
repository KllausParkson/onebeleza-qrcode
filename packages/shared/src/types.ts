export type QrCodeType = "base" | "exclusive";

export type Platform = "ios" | "android" | "amazon";

export interface AppStoreLink {
  id: string;
  qr_code_id: string;
  platform: Platform;
  url: string;
}

export interface WelcomeScreen {
  id: string;
  qr_code_id: string;
  app_name: string | null;
  developer: string | null;
  logo_url: string | null;
  title: string | null;
  description: string | null;
  website: string | null;
  color_primary: string;
  color_secondary: string;
  welcome_image_url: string | null;
}

export interface CustomButton {
  id: string;
  qr_code_id: string;
  label: string;
  url: string;
  order: number;
}

export interface QrCode {
  id: string;
  slug: string;
  type: QrCodeType;
  name: string;
  user_id: string;
  folder_id: string | null;
  scan_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  welcome_screen?: WelcomeScreen;
  app_store_links?: AppStoreLink[];
  custom_buttons?: CustomButton[];
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface ScanEvent {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  user_agent: string | null;
  country: string | null;
}

/** Payload para criar/atualizar um QR Code APP Base */
export interface CreateBaseQrCodePayload {
  name: string;
  slug: string;
  folder_id?: string;
  welcome: {
    color_primary: string;
    color_secondary: string;
    logo_url?: string;
    welcome_image_url?: string;
    title?: string;
    description?: string;
  };
}

/** Payload para criar/atualizar um QR Code APP Exclusivo */
export interface CreateExclusiveQrCodePayload {
  name: string;
  slug: string;
  folder_id?: string;
  welcome: {
    app_name: string;
    developer?: string;
    logo_url?: string;
    title?: string;
    description?: string;
    website?: string;
    color_primary: string;
    color_secondary: string;
    welcome_image_url?: string;
  };
  app_store_links: {
    platform: Platform;
    url: string;
  }[];
  custom_buttons?: {
    label: string;
    url: string;
    order: number;
  }[];
}

/** Links fixos do APP Base (One Beleza) */
export const ONE_BELEZA_LINKS = {
  android: "https://play.google.com/store/apps/details?id=onebeleza.app",
  ios: "https://apps.apple.com/us/app/one-beleza-novo-app/id1549875818",
} as const;
