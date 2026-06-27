"use client";
import Image from "next/image";

interface WelcomeData {
  app_name?: string;
  developer?: string;
  logo_url?: string;
  title?: string;
  description?: string;
  color_primary?: string;
  color_secondary?: string;
  welcome_image_url?: string;
}

interface StoreLink {
  platform: "ios" | "android" | "amazon";
  url: string;
}

interface Props {
  welcome: WelcomeData;
  storeLinks?: StoreLink[];
  type: "base" | "exclusive";
}

const STORE_BADGES: Record<string, { label: string; bg: string }> = {
  ios: { label: "Download on the App Store", bg: "#000000" },
  android: { label: "Get it on Google Play", bg: "#000000" },
  amazon: { label: "Available at Amazon Appstore", bg: "#FF9900" },
};

export default function PhonePreview({ welcome, storeLinks = [], type }: Props) {
  const primaryColor = welcome.color_primary || "#22c55e";
  const secondaryColor = welcome.color_secondary || "#f0fdf4";

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame */}
      <div
        className="relative w-56 rounded-[2.5rem] border-[6px] border-gray-800 overflow-hidden"
        style={{ height: 420 }}
      >
        {/* Status bar */}
        <div
          className="h-6 flex items-center justify-center relative"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="w-16 h-1.5 bg-black/20 rounded-full" />
        </div>

        {/* Content */}
        <div
          className="flex flex-col items-center px-4 py-5 overflow-hidden"
          style={{ backgroundColor: secondaryColor, minHeight: "calc(100% - 24px)" }}
        >
          {/* Share icon placeholder */}
          <div className="self-end mb-2">
            <div className="w-5 h-5 rounded-full border border-black/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-black/50">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
            </div>
          </div>

          {/* Logo */}
          {welcome.logo_url ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 border border-black/10">
              <img src={welcome.logo_url} alt="logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {(welcome.app_name ?? "A").charAt(0).toUpperCase()}
            </div>
          )}

          {/* App name & developer */}
          {welcome.app_name && (
            <p className="text-xs font-semibold text-gray-900 text-center">{welcome.app_name}</p>
          )}
          {welcome.developer && (
            <p className="text-[10px] text-gray-500 text-center">{welcome.developer}</p>
          )}

          {/* Title */}
          {welcome.title && (
            <p className="text-sm font-bold text-gray-900 text-center mt-2 leading-tight">
              {welcome.title}
            </p>
          )}

          {/* Description */}
          {welcome.description && (
            <p className="text-[10px] text-gray-500 text-center mt-1 leading-relaxed line-clamp-3">
              {welcome.description}
            </p>
          )}

          {/* Store buttons */}
          <div className="mt-4 w-full space-y-1.5">
            {storeLinks.length > 0
              ? storeLinks.map((link) => (
                  <div
                    key={link.platform}
                    className="w-full rounded-lg px-3 py-2 flex items-center justify-center"
                    style={{ backgroundColor: STORE_BADGES[link.platform]?.bg ?? "#000" }}
                  >
                    <span className="text-[10px] text-white font-medium">
                      {STORE_BADGES[link.platform]?.label}
                    </span>
                  </div>
                ))
              : type === "base"
              ? ["ios", "android"].map((p) => (
                  <div
                    key={p}
                    className="w-full rounded-lg px-3 py-2 flex items-center justify-center bg-black"
                  >
                    <span className="text-[10px] text-white font-medium">
                      {STORE_BADGES[p].label}
                    </span>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">Preview</p>
    </div>
  );
}
