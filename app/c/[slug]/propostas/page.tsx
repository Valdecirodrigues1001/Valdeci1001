import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
} from "lucide-react";

import {
  Accessibility,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Bus,
  Cpu,
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
} from "lucide-react";

import {
  getAllProposalsPageData,
} from "./actions";

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

type AllProposalsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: AllProposalsPageProps): Promise<Metadata> {
  const { slug } = await params;

  const data =
    await getAllProposalsPageData(
      slug
    );

  if (!data) {
    return {
      title:
        "Propostas não encontradas",
    };
  }

  return {
    title:
      `Propostas | ${data.landing.public_name}`,

    description:
      `Conheça todas as propostas e compromissos de ${data.landing.public_name}.`,
  };
}

export default async function AllProposalsPage({
  params,
}: AllProposalsPageProps) {
  const { slug } = await params;

  const data =
    await getAllProposalsPageData(
      slug
    );

  if (!data) {
    notFound();
  }

  const {
    landing,
    proposals,
  } = data;

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor:
          landing.primary_color,
        color:
          landing.accent_color,
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <Link
          href={`/c/${landing.slug}#propostas`}
          className="inline-flex items-center gap-2 text-sm font-black transition hover:gap-3"
          style={{
            color:
              landing.secondary_color,
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a campanha
        </Link>

        <div className="mt-12 max-w-3xl">
          <p
            className="text-sm font-black uppercase tracking-[0.22em]"
            style={{
              color:
                landing.secondary_color,
            }}
          >
            Compromissos
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Todas as propostas
          </h1>

          <p className="mt-6 text-base leading-8 opacity-75">
            Conheça os compromissos,
            projetos e prioridades
            apresentados por{" "}
            {landing.public_name}.
          </p>
        </div>

        {proposals.length === 0 ? (
          <div className="mt-14 rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-base font-bold">
              Nenhuma proposta publicada
              no momento.
            </p>
          </div>
        ) : (
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
                    key={
                      proposal.id
                    }
                    className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[2rem] border p-7 transition duration-300 hover:-translate-y-1"
                    style={{
                      borderColor:
                        proposal.is_featured
                          ? `${landing.secondary_color}80`
                          : `${landing.accent_color}1F`,

                      backgroundColor:
                        proposal.is_featured
                          ? `${landing.secondary_color}14`
                          : `${landing.accent_color}0D`,
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

                    {proposal.category ? (
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
                    ) : null}

                    <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em]">
                      {proposal.title}
                    </h2>

                    {proposal.summary ? (
                      <p className="mt-4 line-clamp-4 text-sm leading-7 opacity-70">
                        {
                          proposal.summary
                        }
                      </p>
                    ) : null}

                    <div className="mt-auto pt-8">
                      <Link
                        href={`/c/${landing.slug}/propostas/${proposal.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-black transition group-hover:gap-3"
                        style={{
                          color:
                            landing.secondary_color,
                        }}
                      >
                        Ver proposta completa

                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    {proposal.is_featured ? (
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
                    ) : null}
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}