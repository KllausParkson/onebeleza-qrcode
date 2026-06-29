import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import WelcomeScreen from "@/components/qrcode/WelcomeScreen";
import { getWelcomeScreen } from "@/lib/qrcode-form";
import {
  getPublicQrCodeBySlug,
  recordQrCodeScan,
} from "@/lib/public-qrcode";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const qr = await getPublicQrCodeBySlug(slug);
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
  const qr = await getPublicQrCodeBySlug(slug);
  if (!qr) notFound();

  const headersList = await headers();
  recordQrCodeScan(qr.id, headersList.get("user-agent") ?? "");

  return <WelcomeScreen qrCode={qr} />;
}
