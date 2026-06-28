import { z } from "zod";

/** Permite letras maiúsculas, minúsculas, números e hífens */
export const SLUG_REGEX = /^[a-zA-Z0-9-]+$/;

export const slugFieldSchema = z
  .string()
  .min(1, "URL é obrigatória")
  .regex(SLUG_REGEX, "Use apenas letras, números e hífens");

/** Gera sugestão de slug a partir do nome (somente ao preencher o nome) */
export function slugFromName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function publicUrlPrefix(): string {
  const base = process.env.NEXT_PUBLIC_PUBLIC_URL ?? "http://localhost:3000";
  try {
    return `${new URL(base).host}/`;
  } catch {
    return "localhost:3000/";
  }
}
