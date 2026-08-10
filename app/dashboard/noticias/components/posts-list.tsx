"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CalendarDays,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  MoreVertical,
  Newspaper,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  deletePost,
  togglePostPublication,
} from "../actions";

import type { PostListItem } from "../types";

type PostsListProps = {
  posts: PostListItem[];
  editingPostId?: string | null;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Não publicada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(date);
}

export default function PostsList({
  posts,
  editingPostId = null,
}: PostsListProps) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  const [
    activePostId,
    setActivePostId,
  ] = useState<string | null>(null);

  const [
    openMenuId,
    setOpenMenuId,
  ] = useState<string | null>(null);

  const [
    feedback,
    setFeedback,
  ] = useState<FeedbackState>(null);

  function runAction(
    postId: string,
    action: () => Promise<{
      success: boolean;
      message: string;
    }>
  ) {
    setFeedback(null);
    setActivePostId(postId);
    setOpenMenuId(null);

    startTransition(async () => {
      try {
        const result = await action();

        setFeedback({
          type: result.success
            ? "success"
            : "error",
          message: result.message,
        });

        if (result.success) {
          router.refresh();
        }
      } catch (error) {
        console.error(
          "Erro ao executar ação da notícia:",
          error
        );

        setFeedback({
          type: "error",
          message:
            "Não foi possível concluir esta ação.",
        });
      } finally {
        setActivePostId(null);
      }
    });
  }

  function handleTogglePublication(
    postId: string
  ) {
    runAction(postId, () =>
      togglePostPublication(postId)
    );
  }

  function handleDelete(
    post: PostListItem
  ) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a notícia "${post.title}"?\n\nEsta ação não poderá ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    runAction(post.id, async () => {
      const result = await deletePost(
        post.id
      );

      if (
        result.success &&
        editingPostId === post.id
      ) {
        router.push(
          "/dashboard/noticias"
        );
      }

      return result;
    });
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Conteúdo cadastrado
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            Notícias da campanha
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {posts.length === 1
              ? "1 notícia cadastrada"
              : `${posts.length} notícias cadastradas`}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
          <Newspaper className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      {feedback ? (
        <div className="border-b border-slate-100 px-6 py-4">
          <div
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              feedback.type ===
              "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-950">
            Nenhuma notícia cadastrada
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Use o formulário ao lado para
            cadastrar a primeira notícia da
            campanha.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {posts.map((post) => {
            const isCurrentPostPending =
              pending &&
              activePostId === post.id;

            const isBeingEdited =
              editingPostId === post.id;

            const isPublished =
              post.status === "published";

            return (
              <article
                key={post.id}
                className={`relative p-6 transition ${
                  isBeingEdited
                    ? "bg-blue-50/60"
                    : "hover:bg-slate-50/70"
                }`}
              >
                {isBeingEdited ? (
                  <div className="mb-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    Em edição
                  </div>
                ) : null}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={
                          isCurrentPostPending
                        }
                        onClick={() =>
                          handleTogglePublication(
                            post.id
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          isPublished
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {isCurrentPostPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isPublished ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}

                        {isPublished
                          ? "Publicada"
                          : "Rascunho"}
                      </button>

                      {post.author_name ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          <UserRound className="h-3.5 w-3.5" />
                          {post.author_name}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                      {post.cover_image_url ? (
                        <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:w-40">
                          <img
                            src={
                              post.cover_image_url
                            }
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-lg font-black text-slate-950">
                          {post.title}
                        </h3>

                        {post.excerpt ? (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                            {post.excerpt}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm italic text-slate-400">
                            Nenhum resumo
                            informado.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />

                        {isPublished
                          ? `Publicada em ${formatDate(
                              post.published_at
                            )}`
                          : "Ainda não publicada"}
                      </span>

                      <span>
                        Criada em{" "}
                        {formatDate(
                          post.created_at
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start gap-2">
                    <span className="hidden max-w-[200px] truncate rounded-xl bg-slate-100 px-3 py-2 font-mono text-xs text-slate-500 lg:inline-flex">
                      /noticias/{post.slug}
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        aria-label="Abrir ações da notícia"
                        aria-expanded={
                          openMenuId === post.id
                        }
                        disabled={
                          isCurrentPostPending
                        }
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId ===
                              post.id
                              ? null
                              : post.id
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCurrentPostPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </button>

                      {openMenuId ===
                      post.id ? (
                        <>
                          <button
                            type="button"
                            aria-label="Fechar menu"
                            onClick={() =>
                              setOpenMenuId(
                                null
                              )
                            }
                            className="fixed inset-0 z-20 cursor-default"
                          />

                          <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                            <Link
                              href={`/dashboard/noticias?edit=${post.id}`}
                              onClick={() =>
                                setOpenMenuId(
                                  null
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                            >
                              <Edit3 className="h-4 w-4" />
                              Editar notícia
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleTogglePublication(
                                  post.id
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                            >
                              {isPublished ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}

                              {isPublished
                                ? "Mover para rascunho"
                                : "Publicar notícia"}
                            </button>

                            <div className="my-2 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  post
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir notícia
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}