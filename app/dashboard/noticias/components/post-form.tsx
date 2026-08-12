"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FileImage,
  FileText,
  ImagePlus,
  Loader2,
  Newspaper,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  RichTextEditor,
  type RichTextValue,
} from "@/components/editor";

import {
  createPost,
  updatePost,
} from "../actions";

import type {
  PostActionState,
  PostFormData,
  PostStatus,
} from "../types";

type PostFormProps = {
  post?: PostFormData | null;
};

const initialState: PostActionState = {
  success: false,
  message: "",
};

function createEmptyDocument(): RichTextValue {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  };
}

function parsePostContent(
  content: string | null | undefined
): RichTextValue {
  if (!content?.trim()) {
    return createEmptyDocument();
  }

  try {
    const parsedContent: unknown =
      JSON.parse(content);

    if (
      typeof parsedContent === "object" &&
      parsedContent !== null &&
      "type" in parsedContent &&
      parsedContent.type === "doc"
    ) {
      return parsedContent as RichTextValue;
    }
  } catch {
    /*
     * Compatibilidade com conteúdos antigos.
     */
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      },
    ],
  };
}

export default function PostForm({
  post = null,
}: PostFormProps) {
  const router = useRouter();

  const formRef =
    useRef<HTMLFormElement>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [formVersion, setFormVersion] =
    useState(0);

  const [content, setContent] =
    useState<RichTextValue>(() =>
      parsePostContent(post?.content)
    );

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<string | null>(
    post?.cover_image_url ?? null
  );

  const [
    removeExistingImage,
    setRemoveExistingImage,
  ] = useState(false);

  const isEditing =
    Boolean(post?.id);

  const action =
    isEditing && post
      ? updatePost.bind(
          null,
          post.id
        )
      : createPost;

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    initialState
  );

  useEffect(() => {
    setContent(
      parsePostContent(
        post?.content
      )
    );

    setSelectedFile(null);

    setPreviewUrl(
      post?.cover_image_url ??
        null
    );

    setRemoveExistingImage(
      false
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }, [
    post?.id,
    post?.content,
    post?.cover_image_url,
  ]);

 useEffect(() => {
  if (!state.success) {
    return;
  }

  if (isEditing) {
    router.replace(
      "/dashboard/noticias"
    );

    router.refresh();

    return;
  }

  formRef.current?.reset();

  setContent(
    createEmptyDocument()
  );

  setSelectedFile(null);
  setPreviewUrl(null);

  setRemoveExistingImage(
    false
  );

  if (fileInputRef.current) {
    fileInputRef.current.value =
      "";
  }

  setFormVersion(
    (version) =>
      version + 1
  );

  router.refresh();
}, [state, router]);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedFile
      );

    setPreviewUrl(
      objectUrl
    );

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [selectedFile]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ??
      null;

    if (!file) {
      return;
    }

    setSelectedFile(file);

    setRemoveExistingImage(
      false
    );
  }

  function handleRemoveImage() {
    setSelectedFile(null);
    setPreviewUrl(null);

    if (
      post?.cover_image_url
    ) {
      setRemoveExistingImage(
        true
      );
    }

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  const serializedContent =
    JSON.stringify(
      content ??
        createEmptyDocument()
    );

  const currentStatus:
    PostStatus =
    post?.status ?? "draft";

  return (
    <form
      key={
        post?.id
          ? `edit-${post.id}`
          : `new-post-${formVersion}`
      }
      ref={formRef}
      action={formAction}
      className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
              <Newspaper className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                {isEditing
                  ? "Gerenciar conteúdo"
                  : "Novo conteúdo"}
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                {isEditing
                  ? "Editar notícia"
                  : "Nova notícia"}
              </h2>
            </div>
          </div>

          {isEditing ? (
            <Link
              href="/dashboard/noticias"
              aria-label="Cancelar edição"
              title="Cancelar edição"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              <X className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          {isEditing
            ? "Atualize as informações da notícia selecionada."
            : "Cadastre notícias, comunicados e conteúdos para exibição na página pública da campanha."}
        </p>

        {isEditing &&
        post?.slug ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Endereço da notícia
            </p>

            <p className="mt-1 break-all font-mono text-xs text-slate-600">
              /noticias/{post.slug}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-6 p-6">
        <div>
          <label
            htmlFor="title"
            className="text-sm font-bold text-slate-800"
          >
            Título da notícia
          </label>

          <div className="relative mt-2">
            <FileText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="title"
              name="title"
              type="text"
              required
              minLength={3}
              maxLength={180}
              defaultValue={
                post?.title ?? ""
              }
              placeholder="Ex.: Campanha participa de encontro com lideranças"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {state.errors?.title ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {state.errors.title}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="excerpt"
            className="text-sm font-bold text-slate-800"
          >
            Resumo
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Texto curto exibido nos
            cards da Landing Page e nos
            compartilhamentos.
          </p>

          <textarea
            id="excerpt"
            name="excerpt"
            rows={4}
            maxLength={500}
            defaultValue={
              post?.excerpt ?? ""
            }
            placeholder="Escreva um resumo curto e objetivo da notícia."
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />

          {state.errors?.excerpt ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {state.errors.excerpt}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="author_name"
            className="text-sm font-bold text-slate-800"
          >
            Autor
          </label>

          <div className="relative mt-2">
            <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="author_name"
              name="author_name"
              type="text"
              defaultValue={
                post?.author_name ??
                ""
              }
              placeholder="Ex.: Assessoria de Comunicação"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">
            Imagem de capa
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Envie uma imagem JPG, PNG ou
            WEBP de até 5 MB.
          </p>

          <input
            type="hidden"
            name="remove_cover_image"
            value={
              removeExistingImage
                ? "true"
                : "false"
            }
            readOnly
          />

          <input
            ref={fileInputRef}
            id="cover_image_file"
            name="cover_image_file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={
              handleImageChange
            }
            disabled={pending}
            className="sr-only"
          />

          {!previewUrl ? (
            <label
              htmlFor="cover_image_file"
              className="mt-3 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <ImagePlus className="h-5 w-5 text-slate-600" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-800">
                Selecionar imagem
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Clique para escolher uma
                imagem do computador.
              </p>
            </label>
          ) : (
            <div className="mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt={
                    post?.title ||
                    "Imagem de capa"
                  }
                  className="aspect-video w-full object-cover"
                />

                <div className="absolute right-3 top-3 flex gap-2">
                  <label
                    htmlFor="cover_image_file"
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/95 px-4 text-xs font-bold text-slate-800 shadow-lg backdrop-blur transition hover:bg-white"
                  >
                    <FileImage className="h-4 w-4" />
                    Trocar
                  </label>

                  <button
                    type="button"
                    onClick={
                      handleRemoveImage
                    }
                    disabled={pending}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              </div>

              {selectedFile ? (
                <div className="border-t border-slate-200 bg-white px-4 py-3">
                  <p className="truncate text-xs font-semibold text-slate-600">
                    {selectedFile.name}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {state.errors?.cover_image ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {
                state.errors
                  .cover_image
              }
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="post-content"
            className="text-sm font-bold text-slate-800"
          >
            Conteúdo completo
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Escreva o conteúdo completo da
            notícia, com títulos, listas,
            links e destaques.
          </p>

          <input
            id="post-content"
            type="hidden"
            name="content"
            value={
              serializedContent
            }
            readOnly
          />

          <div className="mt-2">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Escreva a notícia completa..."
              editable={!pending}
            />
          </div>

          {state.errors?.content ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {state.errors.content}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="status"
            className="text-sm font-bold text-slate-800"
          >
            Situação da notícia
          </label>

          <select
            id="status"
            name="status"
            defaultValue={
              currentStatus
            }
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            <option value="draft">
              Salvar como rascunho
            </option>

            <option value="published">
              Publicar na Landing Page
            </option>
          </select>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Notícias publicadas aparecem
            automaticamente na página
            pública da campanha.
          </p>
        </div>

        {state.message ? (
          <div
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              state.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
        <div
          className={`grid gap-3 ${
            isEditing
              ? "sm:grid-cols-[1fr_1.5fr]"
              : ""
          }`}
        >
          {isEditing ? (
            <Link
              href="/dashboard/noticias"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Link>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                {isEditing
                  ? "Salvando..."
                  : "Cadastrando..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />

                {isEditing
                  ? "Salvar alterações"
                  : "Cadastrar notícia"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}