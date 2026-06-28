"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { slugFieldSchema, slugFromName, publicUrlPrefix } from "@/lib/slug";
import type { CreateExclusiveQrCodePayload, Platform } from "@onebeleza/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhonePreview from "@/components/qrcode/PhonePreview";
import ImageUpload from "@/components/qrcode/ImageUpload";
import { ArrowLeft, Sparkles, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: slugFieldSchema,
  welcome: z.object({
    app_name: z.string().min(1, "Nome do app é obrigatório"),
    developer: z.string().optional(),
    logo_url: z.string().optional(),
    title: z.string().optional(),
    description: z.string().max(250).optional(),
    website: z.string().optional(),
    color_primary: z.string(),
    color_secondary: z.string(),
    welcome_image_url: z.string().optional(),
  }),
  app_store_links: z.array(z.object({
    platform: z.enum(["ios", "android", "amazon"]),
    url: z.string().url("URL inválida"),
  })).min(1, "Adicione ao menos um link de loja"),
  custom_buttons: z.array(z.object({
    label: z.string().min(1),
    url: z.string().url(),
    order: z.number().int(),
  })).optional(),
});

type FormData = z.infer<typeof schema>;

const COLOR_PRESETS = [
  { primary: "#1a1a1a", secondary: "#ffffff" },
  { primary: "#ef4444", secondary: "#fef2f2" },
  { primary: "#3b82f6", secondary: "#eff6ff" },
  { primary: "#8b5cf6", secondary: "#f5f3ff" },
  { primary: "#f97316", secondary: "#fff7ed" },
];

const PLATFORM_OPTIONS: { value: Platform; label: string; placeholder: string }[] = [
  { value: "ios", label: "App Store (iOS)", placeholder: "https://apps.apple.com/us/app/..." },
  { value: "android", label: "Google Play", placeholder: "https://play.google.com/store/apps/..." },
  { value: "amazon", label: "Amazon Appstore", placeholder: "https://www.amazon.com/..." },
];

interface Props {
  token: string;
  mode?: "create" | "edit";
  qrId?: string;
  initialValues?: CreateExclusiveQrCodePayload;
}

export default function ExclusiveQrCodeForm({
  token,
  mode = "create",
  qrId,
  initialValues,
}: Props) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(isEdit ? true : null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("design");
  const slugManuallyEdited = useRef(isEdit);
  const originalSlug = useRef(initialValues?.slug ?? "");

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      welcome: { color_primary: "#1a1a1a", color_secondary: "#ffffff", app_name: "" },
      app_store_links: [{ platform: "ios", url: "" }, { platform: "android", url: "" }],
      custom_buttons: [],
    },
  });

  const { fields: storeFields, append: appendStore, remove: removeStore } = useFieldArray({
    control,
    name: "app_store_links",
  });

  const { fields: buttonFields, append: appendButton, remove: removeButton } = useFieldArray({
    control,
    name: "custom_buttons",
  });

  const watchedValues = watch();
  const urlPrefix = publicUrlPrefix();

  useEffect(() => {
    if (isEdit) {
      slugManuallyEdited.current = true;
      originalSlug.current = initialValues?.slug ?? "";
      setSlugAvailable(true);
    }
  }, [isEdit, initialValues?.slug]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setValue("name", name);
      if (!slugManuallyEdited.current) {
        setValue("slug", slugFromName(name));
        setSlugAvailable(null);
      }
    },
    [setValue]
  );

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      slugManuallyEdited.current = true;
      setValue("slug", e.target.value, { shouldValidate: true });
      setSlugAvailable(null);
    },
    [setValue]
  );

  const checkSlug = useCallback(async (slug: string): Promise<boolean> => {
    const trimmed = slug.trim();
    if (!trimmed) {
      setSlugAvailable(null);
      return false;
    }
    if (isEdit && trimmed === originalSlug.current) {
      setSlugAvailable(true);
      return true;
    }
    setSlugChecking(true);
    try {
      const r = await api.qrcodes.checkSlug(token, trimmed, isEdit ? qrId : undefined);
      setSlugAvailable(r.available);
      return r.available;
    } catch {
      setSlugAvailable(null);
      return false;
    } finally {
      setSlugChecking(false);
    }
  }, [token, isEdit, qrId]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError("");

    const slug = data.slug.trim();
    const available = await checkSlug(slug);
    if (!available) {
      setError("Esta URL já está em uso. Escolha outro nome.");
      setSaving(false);
      return;
    }

    try {
      if (isEdit && qrId) {
        await api.qrcodes.updateExclusive(token, qrId, { ...data, slug });
      } else {
        await api.qrcodes.createExclusive(token, { ...data, slug });
      }
      router.push("/admin/qrcodes");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const sections = [
    { id: "design", label: "Design & Cores" },
    { id: "info", label: "App Information" },
    { id: "links", label: "App Store Links" },
    { id: "welcome", label: "Welcome Screen" },
  ];

  const submitDisabled = saving || slugChecking || slugAvailable !== true;

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6 max-w-xl">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href={isEdit ? "/admin/qrcodes" : "/admin/qrcodes/new"}
            className="text-gray-400 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                {isEdit ? "Editar APP Exclusivo" : "APP Exclusivo"}
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              {isEdit ? "Atualize logo, cores, links e informações" : "Customização completa"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <Label htmlFor="qr-name" className="text-xs text-gray-600">Nome do QR Code *</Label>
            <Input
              id="qr-name"
              {...register("name")}
              onChange={handleNameChange}
              placeholder="Ex: Dom Diego Barbearia"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">URL pública *</Label>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-400 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md px-2.5 h-9 flex items-center">
                {urlPrefix}
              </span>
              <Input
                {...register("slug")}
                onChange={handleSlugChange}
                onBlur={(e) => checkSlug(e.target.value)}
                className="rounded-l-none font-mono text-xs"
              />
            </div>
            {slugChecking && <p className="text-xs text-gray-400 mt-1">Verificando...</p>}
            {slugAvailable === true && <p className="text-xs text-green-500 mt-1">Disponível</p>}
            {slugAvailable === false && (
              <p className="text-xs text-red-500 mt-1">Já está em uso — escolha outro nome</p>
            )}
            {slugAvailable === null && watchedValues.slug && !slugChecking && (
              <p className="text-xs text-amber-600 mt-1">Confirme a disponibilidade saindo do campo</p>
            )}
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {sections.map((section) => (
            <div key={section.id} className="bg-white border border-gray-200 rounded-xl mb-3 overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                onClick={() => setActiveSection(activeSection === section.id ? "" : section.id)}
              >
                <span>{section.label}</span>
                <span className="text-gray-400">{activeSection === section.id ? "▲" : "▼"}</span>
              </button>

              {activeSection === section.id && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-3">
                  {section.id === "design" && (
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">Cores</Label>
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
                            <input type="color" {...register("welcome.color_primary")} className="h-9 w-9 rounded border border-gray-200 cursor-pointer p-1" />
                            <Input {...register("welcome.color_primary")} className="text-xs font-mono" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500">Secundária</Label>
                          <div className="flex gap-2 mt-1">
                            <input type="color" {...register("welcome.color_secondary")} className="h-9 w-9 rounded border border-gray-200 cursor-pointer p-1" />
                            <Input {...register("welcome.color_secondary")} className="text-xs font-mono" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === "info" && (
                    <>
                      <div>
                        <Label className="text-xs text-gray-600">Nome do app *</Label>
                        <Input {...register("welcome.app_name")} placeholder="Nome do seu App" className="mt-1" />
                        {errors.welcome?.app_name && <p className="text-xs text-red-500 mt-1">{errors.welcome.app_name.message}</p>}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Desenvolvedor</Label>
                        <Input {...register("welcome.developer")} placeholder="Nome do desenvolvedor" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Logo do app <span className="text-gray-400">(180×180 px)</span></Label>
                        <ImageUpload
                          token={token}
                          defaultUrl={initialValues?.welcome.logo_url}
                          onUpload={(url) => setValue("welcome.logo_url", url)}
                          hint="180×180 px recomendado"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Título</Label>
                        <Input {...register("welcome.title")} placeholder="Slogan do seu app" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Descrição <span className="text-gray-400">(máx. 250 chars)</span></Label>
                        <Textarea {...register("welcome.description")} placeholder="Descreva seu app em poucas palavras..." rows={3} maxLength={250} className="mt-1 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Website</Label>
                        <Input {...register("welcome.website")} placeholder="www.seusite.com.br" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Botão extra</Label>
                        {buttonFields.map((field, i) => (
                          <div key={field.id} className="flex gap-2 mt-2">
                            <Input {...register(`custom_buttons.${i}.label`)} placeholder="Label do botão" className="text-xs" />
                            <Input {...register(`custom_buttons.${i}.url`)} placeholder="https://..." className="text-xs flex-1" />
                            <button type="button" onClick={() => removeButton(i)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => appendButton({ label: "", url: "", order: buttonFields.length })}
                          className="mt-2 text-xs text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Adicionar botão
                        </button>
                      </div>
                    </>
                  )}

                  {section.id === "links" && (
                    <>
                      <p className="text-xs text-gray-500">Ao menos um link é obrigatório.</p>
                      {storeFields.map((field, i) => {
                        const opt = PLATFORM_OPTIONS.find(p => p.value === watchedValues.app_store_links?.[i]?.platform);
                        return (
                          <div key={field.id} className="space-y-1.5 bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium text-gray-700">{opt?.label ?? "Loja"}</Label>
                              {storeFields.length > 1 && (
                                <button type="button" onClick={() => removeStore(i)} className="text-red-400 hover:text-red-600">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <select
                              {...register(`app_store_links.${i}.platform`)}
                              className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 bg-white"
                            >
                              {PLATFORM_OPTIONS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                            </select>
                            <Input
                              {...register(`app_store_links.${i}.url`)}
                              placeholder={opt?.placeholder ?? "https://..."}
                              className="text-xs"
                            />
                            {errors.app_store_links?.[i]?.url && (
                              <p className="text-xs text-red-500">{errors.app_store_links[i]?.url?.message}</p>
                            )}
                          </div>
                        );
                      })}
                      {storeFields.length < 3 && (
                        <button
                          type="button"
                          onClick={() => appendStore({ platform: "amazon", url: "" })}
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Adicionar loja
                        </button>
                      )}
                      {errors.app_store_links && <p className="text-xs text-red-500">{errors.app_store_links.message}</p>}
                    </>
                  )}

                  {section.id === "welcome" && (
                    <>
                      <p className="text-xs text-gray-500">Imagem exibida enquanto a página carrega.</p>
                      <ImageUpload
                        token={token}
                        defaultUrl={initialValues?.welcome.welcome_image_url}
                        onUpload={(url) => setValue("welcome.welcome_image_url", url)}
                        hint="Será exibida na splash screen"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={submitDisabled} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar QR Code Exclusivo"}
          </Button>
        </form>
      </div>

      <div className="w-72 border-l border-gray-200 bg-gray-50 flex flex-col items-center justify-start pt-16 sticky top-0 h-screen">
        <div className="flex gap-3 mb-6">
          <button type="button" className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-xs font-medium">
            Preview
          </button>
        </div>
        <PhonePreview
          type="exclusive"
          welcome={watchedValues.welcome ?? {}}
          storeLinks={watchedValues.app_store_links?.filter(l => l.url) as { platform: "ios" | "android" | "amazon"; url: string }[]}
        />
      </div>
    </div>
  );
}
