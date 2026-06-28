"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { QrCode } from "@onebeleza/shared";
import { mapBaseQrToForm, mapExclusiveQrToForm, normalizeQrCode } from "@/lib/qrcode-form";
import BaseQrCodeForm from "@/components/qrcode/BaseQrCodeForm";
import ExclusiveQrCodeForm from "@/components/qrcode/ExclusiveQrCodeForm";

interface Props {
  token: string;
  id: string;
}

export default function EditQrCodeClient({ token, id }: Props) {
  const [qr, setQr] = useState<QrCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.qrcodes.get(token, id);
        setQr(normalizeQrCode(data));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar QR Code");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  if (error || !qr) {
    return (
      <div className="p-6 max-w-xl">
        <Link
          href="/admin/qrcodes"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para QR Codes
        </Link>
        <p className="text-sm text-red-600">{error || "QR Code não encontrado"}</p>
      </div>
    );
  }

  if (qr.type === "base") {
    return (
      <BaseQrCodeForm
        token={token}
        mode="edit"
        qrId={id}
        initialValues={mapBaseQrToForm(qr)}
      />
    );
  }

  return (
    <ExclusiveQrCodeForm
      token={token}
      mode="edit"
      qrId={id}
      initialValues={mapExclusiveQrToForm(qr)}
    />
  );
}
