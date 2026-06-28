import type {
  QrCode,
  Folder,
  CreateBaseQrCodePayload,
  CreateExclusiveQrCodePayload,
} from "@onebeleza/shared";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export const api = {
  qrcodes: {
    list: (token: string, params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return apiFetch<{ data: QrCode[]; total: number }>(`/api/qrcodes${qs}`, { token });
    },
    get: (token: string, id: string) =>
      apiFetch<QrCode>(`/api/qrcodes/${id}`, { token }),
    createBase: (token: string, payload: CreateBaseQrCodePayload) =>
      apiFetch<QrCode & { qr_data_url: string }>("/api/qrcodes/base", {
        method: "POST",
        body: JSON.stringify(payload),
        token,
      }),
    createExclusive: (token: string, payload: CreateExclusiveQrCodePayload) =>
      apiFetch<QrCode & { qr_data_url: string }>("/api/qrcodes/exclusive", {
        method: "POST",
        body: JSON.stringify(payload),
        token,
      }),
    update: (token: string, id: string, payload: Record<string, unknown>) =>
      apiFetch<QrCode>(`/api/qrcodes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        token,
      }),
    updateBase: (token: string, id: string, payload: CreateBaseQrCodePayload) =>
      apiFetch<QrCode>(`/api/qrcodes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        token,
      }),
    updateExclusive: (token: string, id: string, payload: CreateExclusiveQrCodePayload) =>
      apiFetch<QrCode>(`/api/qrcodes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        token,
      }),
    delete: (token: string, id: string) =>
      apiFetch<{ success: boolean }>(`/api/qrcodes/${id}`, {
        method: "DELETE",
        token,
      }),
    checkSlug: (token: string, slug: string, excludeId?: string) => {
      const params = new URLSearchParams({ slug });
      if (excludeId) params.set("excludeId", excludeId);
      return apiFetch<{ available: boolean; slug: string }>(
        `/api/qrcodes/slug/check?${params}`,
        { token }
      );
    },
    downloadUrl: (id: string, format: "png" | "svg") =>
      `${API_URL}/api/qrcodes/${id}/download?format=${format}`,
  },
  folders: {
    list: (token: string) => apiFetch<Folder[]>("/api/folders", { token }),
    create: (token: string, name: string) =>
      apiFetch<Folder>("/api/folders", {
        method: "POST",
        body: JSON.stringify({ name }),
        token,
      }),
    delete: (token: string, id: string) =>
      apiFetch<{ success: boolean }>(`/api/folders/${id}`, {
        method: "DELETE",
        token,
      }),
  },
  upload: async (token: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = (await res.json()) as { url: string };
    return data.url;
  },
  public: {
    getWelcomeScreen: (slug: string) =>
      apiFetch<QrCode>(`/public/${slug}`),
  },
};
