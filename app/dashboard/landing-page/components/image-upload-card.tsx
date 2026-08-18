"use client";

import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  removeLandingImage,
  uploadLandingImage,
} from "../actions";

type LandingImageField =
  | "logo"
  | "profile_image"
  | "hero_image"
  | "about_image"
  | "favicon"
  | "seo_image";

type ImageUploadCardProps = {
  imageField: LandingImageField;
  title: string;
  description: string;
  recommendation: string;
  currentImageUrl?: string | null;
  currentStoragePath?: string | null;
  aspectRatio?: "square" | "portrait" | "landscape" | "wide";
};

const aspectRatioClasses = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[16/10]",
  wide: "aspect-[16/7]",
};

export default function ImageUploadCard({
  imageField,
  title,
  description,
  recommendation,
  currentImageUrl,
  currentStoragePath,
  aspectRatio = "landscape",
}: ImageUploadCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [pending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const hasStoredImage = Boolean(
    currentStoragePath || currentImageUrl
  );

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setMessage("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSuccess(false);
      setMessage("Selecione um arquivo de imagem.");
      return;
    }

    setSelectedFile(file);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setSuccess(false);
      setMessage("Selecione uma imagem antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setMessage("");

    startTransition(async () => {
      const result = await uploadLandingImage(
        imageField,
        formData
      );

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        setSelectedFile(null);

        if (inputRef.current) {
          inputRef.current.value = "";
        }

        router.refresh();
      }
    });
  }

  function handleRemove() {
    setMessage("");

    startTransition(async () => {
      const result = await removeLandingImage(imageField);

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        setPreviewUrl(null);
        setSelectedFile(null);

        if (inputRef.current) {
          inputRef.current.value = "";
        }

        router.refresh();
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="text-base font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-6"
      >
        <div
          className={`relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 ${
            aspectRatioClasses[aspectRatio]
          }`}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={`Prévia de ${title}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <ImageIcon className="h-5 w-5 text-slate-400" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                Nenhuma imagem enviada
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Clique abaixo para selecionar uma imagem.
              </p>
            </div>
          )}

          {selectedFile && (
            <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
              Nova imagem selecionada: {selectedFile.name}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Recomendação
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {recommendation}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleFileChange}
          className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 file:mr-4 file:border-0 file:bg-slate-950 file:px-5 file:py-3 file:text-sm file:font-bold file:text-white hover:file:bg-slate-800"
        />

        {message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={pending || !selectedFile}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : hasStoredImage ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Substituir imagem
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Enviar imagem
              </>
            )}
          </button>

          {hasStoredImage && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={pending}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </button>
          )}
        </div>
      </form>
    </div>
  );
}