"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { QrCode } from "@onebeleza/shared";
import { QRCodeSVG } from "qrcode.react";
import { Download, ExternalLink, MoreHorizontal, Pencil, Trash2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const PUBLIC_URL = process.env.NEXT_PUBLIC_PUBLIC_URL ?? "https://qrco.one";

interface Props {
  token: string;
}

export default function QrCodeList({ token }: Props) {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "base" | "exclusive">("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = filter !== "all" ? { type: filter } : undefined;
        const result = await api.qrcodes.list(token, params);
        setQrCodes(result.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, filter]);

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir este QR Code?")) return;
    await api.qrcodes.delete(token, id);
    setQrCodes((prev) => prev.filter((q) => q.id !== id));
  }

  function handleDownload(id: string, slug: string, format: "png" | "svg") {
    const url = api.qrcodes.downloadUrl(id, format);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.${format}`;
    a.click();
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
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

      {/* List */}
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
              {/* QR Preview */}
              <div className="w-14 h-14 flex-shrink-0 bg-white border border-gray-100 rounded-lg p-1 flex items-center justify-center">
                <QRCodeSVG
                  value={`${PUBLIC_URL}/${qr.slug}`}
                  size={48}
                  level="M"
                />
              </div>

              {/* Info */}
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

              {/* Scans */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 justify-end text-gray-700">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="font-semibold text-sm">{qr.scan_count.toLocaleString("pt-BR")}</span>
                </div>
                <span className="text-xs text-gray-400">scans</span>
              </div>

              {/* Actions */}
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
                  onClick={() => handleDownload(qr.id, qr.slug, "png")}
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
