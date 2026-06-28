import Image from "next/image";
import type { Platform } from "@onebeleza/shared";
import appleBadge from "@/lib/img/apple-en.png";
import googleBadge from "@/lib/img/google-en.png";

const BADGE_IMAGES: Partial<Record<Platform, typeof appleBadge>> = {
  ios: appleBadge,
  android: googleBadge,
};

const AMAZON_LABEL = "Available at Amazon Appstore";

interface Props {
  platform: Platform;
  url: string;
  className?: string;
}

export default function StoreBadgeLink({ platform, url, className }: Props) {
  const badge = BADGE_IMAGES[platform];

  if (badge) {
    return (
      <a
        href={url}
        className={`block w-full transition-opacity hover:opacity-90 ${className ?? ""}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={badge}
          alt={platform === "ios" ? "Download on the App Store" : "Get it on Google Play"}
          className="h-11 w-full object-contain"
          priority={false}
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      className={`flex items-center justify-center w-full py-3 px-4 rounded-xl text-white text-sm font-semibold bg-[#FF9900] transition-opacity hover:opacity-90 ${className ?? ""}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {AMAZON_LABEL}
    </a>
  );
}
