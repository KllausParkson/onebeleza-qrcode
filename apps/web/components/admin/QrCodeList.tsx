"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { QrCode } from "@onebeleza/shared";
import { QRCodeSVG } from "qrcode.react";
import { Download, ExternalLink, Pencil, Trash2, TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAdminSession, getFreshAccessToken } from "@/lib/auth/use-admin-session";
import QrCodeListSkeleton from "@/components/admin/QrCodeListSkeleton";

const PUBLIC_URL = process.env.NEXT_PUBLIC_PUBLIC_URL ?? "http://localhost:3000";
const SLOW_LOAD_MS = 4000;

export default function QrCodeList() {
  const { token, ready } = useAdminSession();
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"all" | "base" | "exclusive">("all");

  useEffect(() => {
    if (!ready) return;

    let slowTimer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      setLoading(true);
      setLoadError("");
      setSlowLoad(false);
      slowTimer = setTimeout(() => setSlowLoad(true), SLOW_LOAD_MS);

      try {
        const accessToken = (await getFreshAccessToken()) ?? token;
        if (!accessToken) {
          setLoadError("Sessão expirada. Faça login novamente.");
          return;
        }
        const params = filter !== "all" ? { type: filter } : undefined;
        const result = await api.qrcodes.list(accessToken, params);
        setQrCodes(result.data);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Erro ao carregar QR Codes");
      } finally {
        clearTimeout(slowTimer);
        setSlowLoad(false);
        setLoading(false);
      }
    }

    load();
    return () => clearTimeout(slowTimer);
  }, [token, ready, filter]);

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir este QR Code?")) return;
    const accessToken = (await getFreshAccessToken()) ?? token;
    if (!accessToken) return;
    await api.qrcodes.delete(accessToken, id);
    setQrCodes((prev) => prev.filter((q) => q.id !== id));
  }

  function downloadQR(slug: string, format: "png" | "svg") {
    const qrUrl = `${PUBLIC_URL}/${slug}`;

    if (format === "png") {
      const canvas = document.createElement("canvas");
      const size = 512;
      canvas.width = size;
      canvas.height = size;

      import("qrcode").then(({ default: QRCode }) => {
        QRCode.toCanvas(canvas, qrUrl, { width: size, margin: 2 }, () => {
          const link = document.createElement("a");
          link.download = `${slug}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        });
      });
      return;
    }

    const svgEl = document.querySelector(`[data-qr-slug="${slug}"] svg`);
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${slug}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!ready || loading) {
    return (
      <div>
        {slowLoad && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Carregando QR Codes… O servidor pode levar alguns segundos para iniciar.</span>
          </div>
        )}
        <QrCodeListSkeleton />
      </div>
    );
  }

  return (
    <div>
      {loadError && (
        <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {loadError}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        {(["all", "base", "exclusive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === f
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "all" ? "Todos" : f === "base" ? "APP Base" : "APP Exclusivo"}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500">{qrCodes.length} QR Codes</span>
      </div>

      {qrCodes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Nenhum QR Code encontrado.</p>
          <Link href="/admin/qrcodes/new" className="text-green-500 hover:underline text-sm mt-1 inline-block">
            Criar o primeiro QR Code
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors"
            >
              <div
                data-qr-slug={qr.slug}
                className="w-14 h-14 flex-shrink-0 bg-white border border-gray-100 rounded-lg p-1 flex items-center justify-center"
              >
                <QRCodeSVG
                  value={`${PUBLIC_URL}/${qr.slug}`}
                  size={48}
                  level="M"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={qr.type === "base" ? "secondary" : "default"} className="text-xs">
                    {qr.type === "base" ? "APP Base" : "APP Exclusivo"}
                  </Badge>
                  <span className="font-medium text-gray-900 text-sm truncate">{qr.name}</span>
                  {!qr.is_active && (
                    <Badge variant="outline" className="text-xs text-gray-400">Pausado</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{PUBLIC_URL}/{qr.slug}</p>
                <p className="text-xs text-gray-400">
                  {new Date(qr.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 justify-end text-gray-700">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="font-semibold text-sm">{qr.scan_count.toLocaleString("pt-BR")}</span>
                </div>
                <span className="text-xs text-gray-400">scans</span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <a
                  href={`${PUBLIC_URL}/${qr.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  title="Abrir welcome screen"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => downloadQR(qr.slug, "png")}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4" />
                </button>
                <Link
                  href={`/admin/qrcodes/${qr.id}`}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(qr.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
