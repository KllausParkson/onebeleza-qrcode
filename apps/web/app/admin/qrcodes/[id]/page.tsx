import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditQrCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return (
    <div className="p-6 max-w-xl">
      <Link
        href="/admin/qrcodes"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para QR Codes
      </Link>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Editar QR Code</h1>
      <p className="text-sm text-gray-500 mb-4">
        A edição de QR Codes estará disponível em breve.
      </p>
      <p className="text-xs text-gray-400 font-mono">ID: {id}</p>
    </div>
  );
}
