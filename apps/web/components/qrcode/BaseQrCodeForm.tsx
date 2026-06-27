"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhonePreview from "@/components/qrcode/PhonePreview";
import ImageUpload from "@/components/qrcode/ImageUpload";
import { ArrowLeft, Smartphone } from "lucide-react";
import Link from "next/link";
import { ONE_BELEZA_LINKS } from "@onebeleza/shared";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Use apenas letras, números e hífens"),
  welcome: z.object({
    color_primary: z.string().default("#22c55e"),
    color_secondary: z.string().default("#f0fdf4"),
    logo_url: z.string().optional(),
    welcome_image_url: z.string().optional(),
    title: z.string().optional(),
    description: z.string().max(250).optional(),
  }),
});

type FormData = z.infer<typeof schema>;

const COLOR_PRESETS = [
  { primary: "#1a1a1a", secondary: "#ffffff" },
  { primary: "#ef4444", secondary: "#fef2f2" },
  { primary: "#3b82f6", secondary: "#eff6ff" },
  { primary: "#8b5cf6", secondary: "#f5f3ff" },
  { primary: "#f97316", secondary: "#fff7ed" },
];

export default function BaseQrCodeForm({ token }: { token: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      welcome: { color_primary: "#22c55e", color_secondary: "#f0fdf4" },
    },
  });

  const watchedValues = watch();

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setValue("name", name);
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setValue("slug", slug);
    },
    [setValue]
  );

  const checkSlug = useCallback(
    async (slug: string) => {
      if (!slug) return;
      setSlugChecking(true);
      try {
        const result = await api.qrcodes.checkSlug(token, slug);
        setSlugAvailable(result.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    },
    [token]
  );

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError("");
    try {
      await api.qrcodes.createBase(token, data);
      router.push("/admin/qrcodes");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const storeLinks = [
    { platform: "ios" as const, url: ONE_BELEZA_LINKS.ios },
    { platform: "android" as const, url: ONE_BELEZA_LINKS.android },
  ];

  return (
    <div className="flex h-full">
      {/* Form panel */}
      <div className="flex-1 overflow-y-auto p-6 max-w-xl">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/qrcodes/new" className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-500" />
              <h1 className="text-xl font-semibold text-gray-900">APP Base</h1>
            </div>
            <p className="text-sm text-gray-500">Links One Beleza pré-configurados</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Links fixos */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-medium text-green-700 mb-2">Links pré-configurados (fixos)</p>
            <div className="space-y-1">
              <p className="text-xs text-green-600">
                iOS: <span className="font-mono">{ONE_BELEZA_LINKS.ios}</span>
              </p>
              <p className="text-xs text-green-600">
                Android: <span className="font-mono">{ONE_BELEZA_LINKS.android}</span>
              </p>
            </div>
          </div>

          {/* Design */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px]">✏</span>
              Design & Cores
            </h2>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Esquema de cores</Label>
                <div className="flex gap-2 mb-3">
                  {COLOR_PRESETS.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setValue("welcome.color_primary", c.primary);
                        setValue("welcome.color_secondary", c.secondary);
                      }}
                      className="w-8 h-8 rounded-full border-2 border-white ring-2 ring-gray-200 hover:ring-gray-400 transition-all"
                      style={{ backgroundColor: c.primary }}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        {...register("welcome.color_primary")}
                        className="h-9 w-9 rounded border border-gray-200 cursor-pointer p-1"
                      />
                      <Input {...register("welcome.color_primary")} className="text-xs font-mono" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Secundária</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        {...register("welcome.color_secondary")}
                        className="h-9 w-9 rounded border border-gray-200 cursor-pointer p-1"
                      />
                      <Input {...register("welcome.color_secondary")} className="text-xs font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Info do cliente */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Informações do Cliente</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs text-gray-600">Nome do cliente *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  onChange={handleNameChange}
                  placeholder="Ex: Salon da Maria"
                  className="mt-1"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="slug" className="text-xs text-gray-600">URL pública *</Label>
                <div className="flex items-center gap-0 mt-1">
                  <span className="text-xs text-gray-400 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md px-2.5 h-9 flex items-center">
                    qrco.one/
                  </span>
                  <Input
                    id="slug"
                    {...register("slug")}
                    onBlur={(e) => checkSlug(e.target.value)}
                    placeholder="salon-da-maria"
                    className="rounded-l-none font-mono text-xs"
                  />
                </div>
                {slugChecking && <p className="text-xs text-gray-400 mt-1">Verificando...</p>}
                {slugAvailable === true && <p className="text-xs text-green-500 mt-1">Disponível</p>}
                {slugAvailable === false && <p className="text-xs text-red-500 mt-1">Já está em uso</p>}
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <Label className="text-xs text-gray-600">Logo do cliente</Label>
                <ImageUpload
                  token={token}
                  onUpload={(url) => setValue("welcome.logo_url", url)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="title" className="text-xs text-gray-600">Título da página</Label>
                <Input
                  id="title"
                  {...register("welcome.title")}
                  placeholder="Baixe nosso app"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-xs text-gray-600">
                  Descrição <span className="text-gray-400">(máx. 250 caracteres)</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("welcome.description")}
                  placeholder="Descreva brevemente seu salão..."
                  rows={3}
                  maxLength={250}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600">Imagem da welcome screen</Label>
                <ImageUpload
                  token={token}
                  onUpload={(url) => setValue("welcome.welcome_image_url", url)}
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Salvando..." : "Criar QR Code"}
          </Button>
        </form>
      </div>

      {/* Preview panel */}
      <div className="w-72 border-l border-gray-200 bg-gray-50 flex flex-col items-center justify-start pt-16 sticky top-0 h-screen">
        <div className="flex gap-3 mb-6">
          <button className="px-4 py-1.5 bg-green-500 text-white rounded-full text-xs font-medium">
            Preview
          </button>
          <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-50">
            QR Code
          </button>
        </div>
        <PhonePreview
          type="base"
          welcome={watchedValues.welcome ?? {}}
          storeLinks={storeLinks}
        />
      </div>
    </div>
  );
}
