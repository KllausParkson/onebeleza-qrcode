"use client";
import Image from "next/image";
import { welcomeGradient, isColorDark } from "@/lib/welcome-theme";
import appleBadge from "@/lib/img/apple-en.png";
import googleBadge from "@/lib/img/google-en.png";

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

export default function PhonePreview({ welcome, storeLinks = [], type }: Props) {
  const primaryColor = welcome.color_primary || "#22c55e";
  const secondaryColor = welcome.color_secondary || "#f0fdf4";
  const gradient = welcomeGradient(primaryColor, secondaryColor);
  const lightText = isColorDark(primaryColor);

  const links =
    storeLinks.length > 0
      ? storeLinks
      : type === "base"
        ? [
            { platform: "ios" as const, url: "#" },
            { platform: "android" as const, url: "#" },
          ]
        : [];

  const titleClass = lightText ? "text-white" : "text-gray-900";
  const mutedClass = lightText ? "text-white/80" : "text-gray-500";

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-56 rounded-[2.5rem] border-[6px] border-gray-800 overflow-hidden"
        style={{ height: 420 }}
      >
        {/* Gradiente full-screen (preview mobile) */}
        <div
          className="flex flex-col items-center px-4 py-5 overflow-hidden min-h-full"
          style={{ background: gradient }}
        >
          <div className="self-end mb-2">
            <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white/70">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
            </div>
          </div>

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

          {welcome.app_name && (
            <p className={`text-xs font-semibold text-center ${titleClass}`}>{welcome.app_name}</p>
          )}
          {welcome.developer && (
            <p className={`text-[10px] text-center ${mutedClass}`}>{welcome.developer}</p>
          )}

          {welcome.title && (
            <p className={`text-sm font-bold text-center mt-2 leading-tight ${titleClass}`}>
              {welcome.title}
            </p>
          )}

          {welcome.description && (
            <p className={`text-[10px] text-center mt-1 leading-relaxed line-clamp-3 ${mutedClass}`}>
              {welcome.description}
            </p>
          )}

          <div className="mt-4 w-full space-y-1.5">
            {links.map((link) =>
              link.platform === "ios" || link.platform === "android" ? (
                <div key={link.platform} className="w-full pointer-events-none">
                  <Image
                    src={link.platform === "ios" ? appleBadge : googleBadge}
                    alt=""
                    className="h-7 w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  key={link.platform}
                  className="w-full rounded-lg px-3 py-2 flex items-center justify-center bg-[#FF9900]"
                >
                  <span className="text-[8px] text-white font-medium">Amazon Appstore</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">Preview</p>
    </div>
  );
}
