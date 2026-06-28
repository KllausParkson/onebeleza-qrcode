"use client";
import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  token: string;
  onUpload: (url: string) => void;
  defaultUrl?: string;
  className?: string;
  hint?: string;
}

export default function ImageUpload({ token, onUpload, defaultUrl, className, hint }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultUrl ?? null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const url = await api.upload(token, file);
      setPreview(url);
      onUpload(url);
    } catch {
      setError("Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className={className}>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Upload"
            className="w-20 h-20 rounded-xl object-cover border border-gray-200"
          />
          <button
            type="button"
            onClick={() => { setPreview(null); onUpload(""); }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full border-2 border-dashed border-gray-200 rounded-xl py-4 px-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors",
            uploading && "opacity-60 pointer-events-none"
          )}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-gray-400" />
          )}
          <p className="text-xs text-gray-400">
            {uploading ? "Enviando..." : "Clique ou arraste"}
          </p>
          {hint && <p className="text-[10px] text-gray-300">{hint}</p>}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
