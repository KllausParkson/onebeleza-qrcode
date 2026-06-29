import QrCodeList from "@/components/admin/QrCodeList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function QrCodesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">QR Codes Ativos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie todos os QR Codes dos seus clientes</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/qrcodes/new">
            <Plus className="w-4 h-4" />
            Criar QR Code
          </Link>
        </Button>
      </div>
      <QrCodeList />
    </div>
  );
}
