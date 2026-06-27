"use client";
import { useEffect, useState } from "react";
import type { QrCode, AppStoreLink } from "@onebeleza/shared";
import { Share2 } from "lucide-react";

interface Props {
  qrCode: QrCode;
}

function detectPlatform(): "ios" | "android" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "unknown";
}

const STORE_CONFIG: Record<string, { label: string; icon: string; bg: string }> = {
  ios: {
    label: "Download on the App Store",
    icon: "🍎",
    bg: "#000000",
  },
  android: {
    label: "Get it on Google Play",
    icon: "▶",
    bg: "#000000",
  },
  amazon: {
    label: "Available at Amazon Appstore",
    icon: "a",
    bg: "#FF9900",
  },
};

export default function WelcomeScreen({ qrCode }: Props) {
  const [platform, setPlatform] = useState<"ios" | "android" | "unknown">("unknown");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setPlatform(detectPlatform());
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const ws = qrCode.welcome_screen;
  const links = qrCode.app_store_links ?? [];

  const primaryColor = ws?.color_primary ?? "#22c55e";
  const secondaryColor = ws?.color_secondary ?? "#ffffff";

  // Splash screen
  if (showSplash && ws?.welcome_image_url) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{ backgroundColor: primaryColor }}
      >
        <img
          src={ws.welcome_image_url}
          alt="Loading"
          className="max-w-[180px] max-h-[180px] object-contain"
        />
      </div>
    );
  }

  // Ordena links: plataforma detectada primeiro
  const sortedLinks: AppStoreLink[] = [
    ...links.filter((l) => l.platform === platform),
    ...links.filter((l) => l.platform !== platform),
  ];

  async function handleShare() {
    try {
      await navigator.share({
        title: ws?.app_name ?? qrCode.name,
        text: ws?.description ?? "",
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative"
      style={{ backgroundColor: secondaryColor }}
    >
      {/* Share button */}
      <button
        onClick={handleShare}
        className="absolute top-4 right-4 w-9 h-9 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors"
        aria-label="Compartilhar"
      >
        <Share2 className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center text-center gap-4">
        {/* Logo */}
        {ws?.logo_url ? (
          <img
            src={ws.logo_url}
            alt={ws.app_name ?? "logo"}
            className="w-24 h-24 rounded-3xl object-cover border border-black/10"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            {(ws?.app_name ?? qrCode.name).charAt(0).toUpperCase()}
          </div>
        )}

        {/* App name & developer */}
        {ws?.app_name && (
          <div>
            <h1 className="text-lg font-bold text-gray-900">{ws.app_name}</h1>
            {ws.developer && <p className="text-sm text-gray-500">{ws.developer}</p>}
          </div>
        )}

        {/* Title */}
        {ws?.title && (
          <p className="text-xl font-bold text-gray-900 leading-snug">{ws.title}</p>
        )}

        {/* Description */}
        {ws?.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{ws.description}</p>
        )}

        {/* Store buttons */}
        {sortedLinks.length > 0 && (
          <div className="w-full space-y-2 mt-2">
            {sortedLinks.map((link) => {
              const config = STORE_CONFIG[link.platform];
              if (!config) return null;
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: config.bg }}
                >
                  <span className="text-base">{config.icon}</span>
                  {config.label}
                </a>
              );
            })}
          </div>
        )}

        {/* Custom buttons */}
        {qrCode.custom_buttons && qrCode.custom_buttons.length > 0 && (
          <div className="w-full space-y-2">
            {qrCode.custom_buttons
              .sort((a, b) => a.order - b.order)
              .map((btn) => (
                <a
                  key={btn.id}
                  href={btn.url}
                  className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors hover:opacity-80"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {btn.label}
                </a>
              ))}
          </div>
        )}

        {/* Website */}
        {ws?.website && (
          <a
            href={ws.website.startsWith("http") ? ws.website : `https://${ws.website}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs underline"
            style={{ color: primaryColor }}
          >
            {ws.website}
          </a>
        )}
      </div>
    </div>
  );
}
