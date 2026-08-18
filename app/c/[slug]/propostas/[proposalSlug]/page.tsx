import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
} from "lucide-react";

import {
  RichTextViewer,
} from "@/components/editor";

import {
  getProposalDetailPageData,
} from "./actions";

type ProposalDetailPageProps = {
  params: Promise<{
    slug: string;
    proposalSlug: string;
  }>;
};

function parseProposalContent(
  content:
    | string
    | Record<string, unknown>
    | null
) {
  if (!content) {
    return null;
  }

  if (typeof content !== "string") {
    return content;
  }

  try {
    const parsed =
      JSON.parse(content);

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

export async function generateMetadata({
  params,
}: ProposalDetailPageProps): Promise<Metadata> {
  const {
    slug,
    proposalSlug,
  } = await params;

  const data =
    await getProposalDetailPageData(
      slug,
      proposalSlug
    );

  if (!data) {
    return {
      title:
        "Proposta não encontrada",
    };
  }

  const description =
    data.proposal.summary ||
    `Conheça esta proposta de ${data.landing.public_name}.`;

  return {
    title:
      `${data.proposal.title} | ${data.landing.public_name}`,

    description,
  };
}

export default async function ProposalDetailPage({
  params,
}: ProposalDetailPageProps) {
  const {
    slug,
    proposalSlug,
  } = await params;

  const data =
    await getProposalDetailPageData(
      slug,
      proposalSlug
    );

  if (!data) {
    notFound();
  }

  const {
    landing,
    proposal,
    previousProposal,
    nextProposal,
  } = data;

  const content =
    parseProposalContent(
      proposal.content
    );

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor:
          landing.background_color,
        color:
          landing.text_color,
      }}
    >
      <section
        className="relative overflow-hidden border-b"
        style={{
          borderColor:
            `${landing.primary_color}14`,
          backgroundColor:
            landing.primary_color,
          color:
            landing.accent_color,
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              `${landing.secondary_color}1F`,
          }}
        />

        <div className="relative mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
          <Link
            href={`/c/${landing.slug}/propostas`}
            className="inline-flex items-center gap-2 text-sm font-black transition hover:gap-3"
            style={{
              color:
                landing.secondary_color,
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Todas as propostas
          </Link>

          {proposal.category ? (
            <p
              className="mt-12 text-xs font-black uppercase tracking-[0.2em]"
              style={{
                color:
                  landing.secondary_color,
              }}
            >
              {proposal.category}
            </p>
          ) : null}

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            {proposal.title}
          </h1>

          {proposal.summary ? (
            <p className="mt-6 max-w-3xl text-base leading-8 opacity-75 sm:text-lg">
              {proposal.summary}
            </p>
          ) : null}

          {proposal.is_featured ? (
            <div
              className="mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em]"
              style={{
                backgroundColor:
                  landing.secondary_color,
                color:
                  landing.primary_color,
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Proposta em destaque
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        {content ? (
          <RichTextViewer
            value={content}
            className="text-base leading-8"
          />
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <FileText className="h-8 w-8 text-slate-400" />

            <p className="mt-4 text-base leading-8 text-slate-500">
              O conteúdo completo desta
              proposta ainda não foi
              publicado.
            </p>
          </div>
        )}

        {(previousProposal ||
          nextProposal) ? (
          <div className="mt-14 border-t border-slate-200 pt-8">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Continue navegando
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {previousProposal ? (
                <Link
                  href={`/c/${landing.slug}/propostas/${previousProposal.slug}`}
                  className="group flex min-h-36 flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                    Proposta anterior
                  </div>

                  <p className="mt-5 text-lg font-black leading-snug text-slate-900">
                    {
                      previousProposal.title
                    }
                  </p>
                </Link>
              ) : (
                <div />
              )}

              {nextProposal ? (
                <Link
                  href={`/c/${landing.slug}/propostas/${nextProposal.slug}`}
                  className="group flex min-h-36 flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-white p-6 text-right shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-end gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Próxima proposta

                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>

                  <p className="mt-5 text-lg font-black leading-snug text-slate-900">
                    {
                      nextProposal.title
                    }
                  </p>
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-10 text-center">
          <Link
            href={`/c/${landing.slug}/propostas`}
            className="inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black transition hover:-translate-y-0.5"
            style={{
              borderColor:
                `${landing.primary_color}24`,
              color:
                landing.primary_color,
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Ver todas as propostas
          </Link>
        </div>
      </section>
    </main>
  );
}