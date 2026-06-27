import Link from "next/link";
import { Smartphone, Sparkles, ArrowLeft } from "lucide-react";

export default function NewQrCodePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/qrcodes" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Criar QR Code</h1>
          <p className="text-sm text-gray-500">Escolha o tipo de QR Code</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/qrcodes/new/base"
          className="group flex flex-col bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl p-6 transition-all"
        >
          <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <Smartphone className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">APP Base</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Links do One Beleza já pré-configurados. Ideal para novos clientes que usam nosso APP padrão.
          </p>
          <div className="mt-4 flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-400">Android + iOS pré-setados</span>
          </div>
        </Link>

        <Link
          href="/admin/qrcodes/new/exclusive"
          className="group flex flex-col bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-6 transition-all"
        >
          <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">APP Exclusivo</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Totalmente customizável. Configure os links das lojas, welcome screen e branding completo.
          </p>
          <div className="mt-4 flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <span className="text-xs text-gray-400">Links e design personalizados</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
