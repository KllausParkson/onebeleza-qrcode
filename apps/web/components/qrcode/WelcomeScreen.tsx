"use client";
import { useEffect, useState } from "react";
import type { QrCode, AppStoreLink } from "@onebeleza/shared";
import { getWelcomeScreen } from "@/lib/qrcode-form";
import { welcomeGradient, isColorDark } from "@/lib/welcome-theme";
import StoreBadgeLink from "@/components/qrcode/StoreBadgeLink";
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

const SPLASH_DURATION_MS = 3000;
const SPLASH_FADE_MS = 400;

export default function WelcomeScreen({ qrCode }: Props) {
  const [platform, setPlatform] = useState<"ios" | "android" | "unknown">("unknown");
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  const ws = getWelcomeScreen(qrCode);
  const splashImageUrl = ws?.welcome_image_url || ws?.logo_url;

  useEffect(() => {
    setPlatform(detectPlatform());
    if (!splashImageUrl) {
      setShowSplash(false);
      return;
    }

    const exitTimer = setTimeout(() => setSplashExiting(true), SPLASH_DURATION_MS);
    const hideTimer = setTimeout(
      () => setShowSplash(false),
      SPLASH_DURATION_MS + SPLASH_FADE_MS
    );

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [splashImageUrl]);

  const links = qrCode.app_store_links ?? [];
  const primaryColor = ws?.color_primary ?? "#22c55e";
  const secondaryColor = ws?.color_secondary ?? "#ffffff";
  const displayName = ws?.app_name ?? qrCode.name;
  const gradient = welcomeGradient(primaryColor, secondaryColor);
  const mobileLightText = isColorDark(primaryColor);

  if (showSplash && splashImageUrl) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${splashExiting ? "welcome-splash-exit" : ""}`}
        style={{ background: gradient }}
      >
        <img
          src={splashImageUrl}
          alt={displayName}
          className="welcome-splash-logo max-w-[200px] max-h-[200px] w-[45vw] object-contain"
        />
      </div>
    );
  }

  const sortedLinks: AppStoreLink[] = [
    ...links.filter((l) => l.platform === platform),
    ...links.filter((l) => l.platform !== platform),
  ];

  async function handleShare() {
    try {
      await navigator.share({
        title: displayName,
        text: ws?.description ?? "",
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  const titleClass = mobileLightText
    ? "md:text-gray-900 text-white"
    : "text-gray-900";
  const mutedClass = mobileLightText
    ? "md:text-gray-500 text-white/80"
    : "text-gray-500";
  const shareBtnClass = mobileLightText
    ? "border-white/30 text-white hover:bg-white/10 md:border-black/10 md:text-gray-600 md:hover:bg-black/5"
    : "border-black/10 text-gray-600 hover:bg-black/5";

  return (
    <div className="min-h-screen welcome-main-enter relative bg-white">
      {/* Mobile: gradiente ocupa a tela inteira */}
      <div
        className="absolute inset-0 md:hidden"
        style={{ background: gradient }}
        aria-hidden
      />

      {/* Tablet/desktop: gradiente só no topo */}
      <div
        className="hidden md:block absolute top-0 inset-x-0 h-[min(360px,40vh)]"
        style={{ background: gradient }}
        aria-hidden
      />

      {/* Nome no header (desktop) */}
      <div className="hidden md:block relative z-10 pt-10 text-center">
        <p className="text-sm font-medium text-white drop-shadow-sm">{displayName}</p>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen md:min-h-0 px-6 py-10 md:py-0 md:pb-16">
        <button
          onClick={handleShare}
          className={`absolute top-4 right-4 z-20 w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${shareBtnClass} md:top-[calc(min(360px,40vh)-2.5rem)] md:bg-white md:shadow-md`}
          aria-label="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm md:flex-none md:mt-4 md:bg-white md:rounded-2xl md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:p-8 md:border md:border-gray-100">
          {ws?.logo_url ? (
            <img
              src={ws.logo_url}
              alt={displayName}
              className="w-24 h-24 rounded-3xl object-cover border border-black/10"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {ws?.app_name && (
            <div className="mt-4">
              <h1 className={`text-lg font-bold ${titleClass}`}>{ws.app_name}</h1>
              {ws.developer && <p className={`text-sm ${mutedClass}`}>{ws.developer}</p>}
            </div>
          )}

          {ws?.title && (
            <p className={`text-xl font-bold leading-snug mt-4 ${titleClass}`}>{ws.title}</p>
          )}

          {ws?.description && (
            <p className={`text-sm leading-relaxed mt-2 ${mutedClass}`}>{ws.description}</p>
          )}

          {sortedLinks.length > 0 && (
            <div className="w-full space-y-2.5 mt-6">
              {sortedLinks.map((link) => (
                <StoreBadgeLink key={link.platform} platform={link.platform} url={link.url} />
              ))}
            </div>
          )}

          {qrCode.custom_buttons && qrCode.custom_buttons.length > 0 && (
            <div className="w-full space-y-2 mt-4">
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

          {ws?.website && (
            <a
              href={ws.website.startsWith("http") ? ws.website : `https://${ws.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline mt-4"
              style={{ color: primaryColor }}
            >
              {ws.website}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
