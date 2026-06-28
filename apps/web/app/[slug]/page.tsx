import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { QrCode } from "@onebeleza/shared";
import WelcomeScreen from "@/components/qrcode/WelcomeScreen";
import { getWelcomeScreen, normalizeQrCode } from "@/lib/qrcode-form";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

async function getQrCode(slug: string): Promise<QrCode | null> {
  try {
    const res = await fetch(`${API_URL}/public/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as QrCode;
    return normalizeQrCode(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const qr = await getQrCode(slug);
  if (!qr) return { title: "Não encontrado" };

  const ws = getWelcomeScreen(qr);
  return {
    title: ws?.app_name ?? qr.name,
    description: ws?.description ?? undefined,
    openGraph: {
      title: ws?.title ?? ws?.app_name ?? qr.name,
      description: ws?.description ?? undefined,
      images: ws?.logo_url ? [ws.logo_url] : [],
    },
  };
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const qr = await getQrCode(slug);
  if (!qr) notFound();

  return <WelcomeScreen qrCode={qr} />;
}
