"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Bus,
  CheckCircle2,
  Cpu,
  FileText,
  GraduationCap,
  HandHeart,
  HardHat,
  HeartPulse,
  Landmark,
  Leaf,
  Map,
  Palette,
  ShieldCheck,
  Sprout,
  TreePine,
  Trophy,
  Users,
  Venus,
  Wheat,
  X,
} from "lucide-react";

import { RichTextViewer } from "@/components/editor";

import type {
  LandingData,
  ProposalData,
} from "../types";

type ProposalsProps = {
  landing: LandingData;
  proposals: ProposalData[];
  hasMoreProposals: boolean;
};

const proposalIcons = {
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  "shield-check": ShieldCheck,
  wheat: Wheat,
  "hard-hat": HardHat,
  landmark: Landmark,
  "briefcase-business": BriefcaseBusiness,
  map: Map,
  trophy: Trophy,
  palette: Palette,
  "hand-heart": HandHeart,
  leaf: Leaf,
  bus: Bus,
  cpu: Cpu,
  users: Users,
  venus: Venus,
  accessibility: Accessibility,
  "tree-pine": TreePine,
  "building-2": Building2,
  sprout: Sprout,
  bike: Bike,
  "book-open": BookOpen,
} satisfies Record<
  string,
  React.ComponentType<{
    className?: string;
  }>
>;

function parseProposalContent(
  content: ProposalData["content"]
) {
  if (!content) {
    return null;
  }

  if (typeof content !== "string") {
    return content;
  }

  try {
    const parsed = JSON.parse(content);

    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.type === "doc"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export default function Proposals({
  landing,
  proposals,
  hasMoreProposals,
}: ProposalsProps) {
  const [
    selectedProposal,
    setSelectedProposal,
  ] = useState<ProposalData | null>(
    null
  );

  if (
    !landing.show_proposals ||
    proposals.length === 0
  ) {
    return null;
  }

  const selectedContent =
    selectedProposal
      ? parseProposalContent(
          selectedProposal.content
        )
      : null;

  return (
    <>
      <section
        id="propostas"
        className="relative overflow-hidden py-24 sm:py-28"
        style={{
          backgroundColor:
            landing.primary_color,
          color:
            landing.accent_color,
        }}
      >
        {/* DECORAÇÃO */}
        <div
          aria-hidden="true"
          className="absolute -left-40 top-20 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              `${landing.secondary_color}1F`,
          }}
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-48 right-0 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              `${landing.secondary_color}14`,
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* CABEÇALHO */}
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="text-sm font-black uppercase tracking-[0.22em]"
              style={{
                color:
                  landing.secondary_color,
              }}
            >
              Compromissos
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              Propostas para transformar
              ideias em resultados
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 opacity-75">
              Conheça os principais
              compromissos desta campanha e
              as ações planejadas para
              representar a população.
            </p>
          </div>

          {/* CARDS */}
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {proposals.map(
              (proposal, index) => {
                const ProposalIcon =
                  proposal.icon &&
                  proposalIcons[
                    proposal.icon as keyof typeof proposalIcons
                  ]
                    ? proposalIcons[
                        proposal.icon as keyof typeof proposalIcons
                      ]
                    : FileText;

                return (
                  <article
                    key={proposal.id}
                    className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-[2rem] border p-7 transition duration-300 hover:-translate-y-1"
                    style={{
                      borderColor:
                        `${landing.secondary_color}80`,
                      backgroundColor:
                        `${landing.secondary_color}14`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor:
                            `${landing.secondary_color}1F`,
                          color:
                            landing.secondary_color,
                        }}
                      >
                        <ProposalIcon className="h-5 w-5" />
                      </div>

                      <span
                        className="text-sm font-black"
                        style={{
                          color:
                            landing.secondary_color,
                        }}
                      >
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    {proposal.category && (
                      <p
                        className="mt-7 text-xs font-black uppercase tracking-[0.18em]"
                        style={{
                          color:
                            landing.secondary_color,
                        }}
                      >
                        {
                          proposal.category
                        }
                      </p>
                    )}

                    <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em]">
                      {proposal.title}
                    </h3>

                    {proposal.summary && (
                      <p className="mt-4 line-clamp-4 text-sm leading-7 opacity-70">
                        {
                          proposal.summary
                        }
                      </p>
                    )}

                    <div className="mt-auto pt-8">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProposal(
                            proposal
                          )
                        }
                        className="inline-flex items-center gap-2 text-sm font-black transition group-hover:gap-3"
                        style={{
                          color:
                            landing.secondary_color,
                        }}
                      >
                        Ver proposta completa

                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div
                      className="absolute right-0 top-0 rounded-bl-2xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em]"
                      style={{
                        backgroundColor:
                          landing.secondary_color,
                        color:
                          landing.primary_color,
                      }}
                    >
                      Destaque
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {/* VER TODAS */}
          {hasMoreProposals && (
            <div className="mt-12 flex justify-center">
              <Link
                href={`/c/${landing.slug}/propostas`}
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border px-8 text-sm font-black transition duration-300 hover:-translate-y-0.5"
                style={{
                  borderColor:
                    landing.secondary_color,
                  backgroundColor:
                    landing.secondary_color,
                  color:
                    landing.primary_color,
                }}
              >
                Ver todas as propostas

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {selectedProposal && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="proposal-modal-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedProposal(null);
            }
          }}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] shadow-2xl sm:rounded-[2rem]"
            style={{
              backgroundColor:
                landing.background_color,
              color:
                landing.text_color,
            }}
          >
            {/* CABEÇALHO MODAL */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-6 py-5 backdrop-blur-xl sm:px-8"
              style={{
                borderColor:
                  `${landing.primary_color}1A`,
                backgroundColor:
                  `${landing.background_color}F2`,
              }}
            >
              <div>
                {selectedProposal.category && (
                  <p
                    className="text-xs font-black uppercase tracking-[0.18em]"
                    style={{
                      color:
                        landing.secondary_color,
                    }}
                  >
                    {
                      selectedProposal.category
                    }
                  </p>
                )}

                <h2
                  id="proposal-modal-title"
                  className="mt-1 text-xl font-black sm:text-2xl"
                >
                  {
                    selectedProposal.title
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProposal(null)
                }
                aria-label="Fechar proposta"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition hover:scale-105"
                style={{
                  borderColor:
                    `${landing.primary_color}1F`,
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CONTEÚDO MODAL */}
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              {selectedProposal.summary && (
                <div
                  className="mb-8 rounded-2xl border p-5"
                  style={{
                    borderColor:
                      `${landing.secondary_color}33`,
                    backgroundColor:
                      `${landing.secondary_color}0D`,
                  }}
                >
                  <div className="flex gap-3">
                    <CheckCircle2
                      className="mt-1 h-5 w-5 shrink-0"
                      style={{
                        color:
                          landing.secondary_color,
                      }}
                    />

                    <p className="text-base font-semibold leading-7">
                      {
                        selectedProposal.summary
                      }
                    </p>
                  </div>
                </div>
              )}

              {selectedContent ? (
                <RichTextViewer
                  value={
                    selectedContent
                  }
                />
              ) : (
                <p className="text-base leading-8 opacity-70">
                  O conteúdo completo desta
                  proposta ainda não foi
                  publicado.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}