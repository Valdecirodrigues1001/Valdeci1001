"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Award,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Hash,
  Loader2,
  MoreVertical,
  Star,
  Tag,
  Trash2,
} from "lucide-react";

import {
  deleteProposal,
  toggleProposalFeatured,
  toggleProposalPublication,
} from "../actions";

export type ProposalListItem = {
  id: string;
  campaign_id: string;
  title: string;
  slug: string;
  category: string | null;
  summary: string | null;
  content: string | null;
  icon: string | null;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ProposalsListProps = {
  proposals: ProposalListItem[];
  editingProposalId?: string | null;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function ProposalsList({
  proposals,
  editingProposalId = null,
}: ProposalsListProps) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [activeProposalId, setActiveProposalId] =
    useState<string | null>(null);
  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);
  const [feedback, setFeedback] =
    useState<FeedbackState>(null);

  function runAction(
    proposalId: string,
    action: () => Promise<{
      success: boolean;
      message: string;
    }>
  ) {
    setFeedback(null);
    setActiveProposalId(proposalId);
    setOpenMenuId(null);

    startTransition(async () => {
      try {
        const result = await action();

        setFeedback({
          type: result.success ? "success" : "error",
          message: result.message,
        });

        if (result.success) {
          router.refresh();
        }
      } catch (error) {
        console.error(
          "Erro ao executar ação da proposta:",
          error
        );

        setFeedback({
          type: "error",
          message:
            "Não foi possível concluir esta ação.",
        });
      } finally {
        setActiveProposalId(null);
      }
    });
  }

  function handleTogglePublication(
    proposalId: string
  ) {
    runAction(proposalId, () =>
      toggleProposalPublication(proposalId)
    );
  }

  function handleToggleFeatured(
    proposalId: string
  ) {
    runAction(proposalId, () =>
      toggleProposalFeatured(proposalId)
    );
  }

  function handleDelete(
    proposal: ProposalListItem
  ) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a proposta "${proposal.title}"?\n\nEsta ação não poderá ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    runAction(proposal.id, async () => {
      const result = await deleteProposal(
        proposal.id
      );

      if (
        result.success &&
        editingProposalId === proposal.id
      ) {
        router.push("/dashboard/propostas");
      }

      return result;
    });
  }

  return (
    <section className="min-w-0 overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Conteúdo cadastrado
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            Propostas da campanha
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {proposals.length === 1
              ? "1 proposta cadastrada"
              : `${proposals.length} propostas cadastradas`}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
          <Flag className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      {feedback && (
        <div className="border-b border-slate-100 px-6 py-4">
          <div
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-950">
            Nenhuma proposta cadastrada
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Use o formulário ao lado para cadastrar a
            primeira proposta ou bandeira da campanha.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-visible">
          {proposals.map((proposal) => {
            const isCurrentProposalPending =
              pending &&
              activeProposalId === proposal.id;

            const isBeingEdited =
              editingProposalId === proposal.id;

            return (
              <article
                key={proposal.id}
                className={`relative p-6 transition ${
                  isBeingEdited
                    ? "bg-blue-50/60"
                    : "hover:bg-slate-50/70"
                }`}
              >
                {isBeingEdited && (
                  <div className="mb-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    Em edição
                  </div>
                )}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {proposal.category && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          <Tag className="h-3.5 w-3.5" />
                          {proposal.category}
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={isCurrentProposalPending}
                        onClick={() =>
                          handleTogglePublication(
                            proposal.id
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          proposal.is_published
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {isCurrentProposalPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : proposal.is_published ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}

                        {proposal.is_published
                          ? "Publicada"
                          : "Rascunho"}
                      </button>

                      <button
                        type="button"
                        disabled={isCurrentProposalPending}
                        onClick={() =>
                          handleToggleFeatured(
                            proposal.id
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          proposal.is_featured
                            ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {proposal.is_featured ? (
                          <Award className="h-3.5 w-3.5" />
                        ) : (
                          <Star className="h-3.5 w-3.5" />
                        )}

                        {proposal.is_featured
                          ? "Destaque"
                          : "Destacar"}
                      </button>
                    </div>

                    <h3 className="mt-4 break-words text-lg font-black text-slate-950">
                      {proposal.title}
                    </h3>

                    {proposal.summary ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {proposal.summary}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm italic text-slate-400">
                        Nenhum resumo informado.
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        Ordem {proposal.display_order}
                      </span>

                      <span>
                        Atualizada em{" "}
                        {formatDate(
                          proposal.updated_at
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start gap-2">
                    <span className="hidden max-w-[180px] truncate rounded-xl bg-slate-100 px-3 py-2 font-mono text-xs text-slate-500 lg:inline-flex">
                      /{proposal.slug}
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        aria-label="Abrir ações da proposta"
                        aria-expanded={
                          openMenuId === proposal.id
                        }
                        disabled={isCurrentProposalPending}
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === proposal.id
                              ? null
                              : proposal.id
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCurrentProposalPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </button>

                      {openMenuId === proposal.id && (
                        <>
                          <button
                            type="button"
                            aria-label="Fechar menu"
                            onClick={() =>
                              setOpenMenuId(null)
                            }
                            className="fixed inset-0 z-[9998] cursor-default"
                          />

                         <div className="absolute right-0 top-12 z-[9999] w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                            <Link
                              href={`/dashboard/propostas?edit=${proposal.id}`}
                              onClick={() =>
                                setOpenMenuId(null)
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                            >
                              <Edit3 className="h-4 w-4" />
                              Editar proposta
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleTogglePublication(
                                  proposal.id
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                            >
                              {proposal.is_published ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}

                              {proposal.is_published
                                ? "Mover para rascunho"
                                : "Publicar proposta"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleFeatured(
                                  proposal.id
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                            >
                              {proposal.is_featured ? (
                                <Award className="h-4 w-4" />
                              ) : (
                                <Star className="h-4 w-4" />
                              )}

                              {proposal.is_featured
                                ? "Remover destaque"
                                : "Adicionar destaque"}
                            </button>

                            <div className="my-2 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(proposal)
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir proposta
                            </button>
                          </div>
                        </>
                      )}
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