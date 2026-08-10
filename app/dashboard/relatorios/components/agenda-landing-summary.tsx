import {
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  FileText,
  Flag,
  Globe2,
  Target,
  Users,
} from "lucide-react";

import type {
  AgendaReport,
  LandingReport,
} from "../types";

type AgendaLandingSummaryProps = {
  agenda: AgendaReport;
  landing: LandingReport;
};

type SummaryItem = {
  label: string;
  value: number;
  description: string;
  icon: typeof CalendarClock;
};

type SummaryCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: SummaryItem[];
  icon: typeof CalendarClock;
};

function SummaryCard({
  eyebrow,
  title,
  description,
  items,
  icon: HeaderIcon,
}: SummaryCardProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            {title}
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <HeaderIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-600">
                    {item.label}
                  </p>

                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                    {item.value.toLocaleString(
                      "pt-BR"
                    )}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function AgendaLandingSummary({
  agenda,
  landing,
}: AgendaLandingSummaryProps) {
  const agendaItems: SummaryItem[] = [
    {
      label: "Eventos futuros",
      value: agenda.upcomingEvents,
      description:
        "Compromissos agendados ou confirmados.",
      icon: CalendarClock,
    },
    {
      label: "Eventos realizados",
      value: agenda.completedEvents,
      description:
        "Compromissos concluídos pela campanha.",
      icon: CalendarCheck2,
    },
    {
      label: "Eventos cancelados",
      value: agenda.cancelledEvents,
      description:
        "Compromissos marcados como cancelados.",
      icon: CalendarX2,
    },
    {
      label: "Público estimado",
      value: agenda.estimatedAudience,
      description:
        "Soma do público estimado nos eventos concluídos.",
      icon: Users,
    },
    {
      label: "Média por evento",
      value: agenda.averageAudience,
      description:
        "Média estimada de participantes por evento realizado.",
      icon: Target,
    },
  ];

  const landingItems: SummaryItem[] = [
    {
      label: "Leads da Landing",
      value: landing.landingLeads,
      description:
        "Cadastros recebidos pelo formulário Quero apoiar.",
      icon: Users,
    },
    {
      label: "Propostas publicadas",
      value: landing.publishedProposals,
      description:
        "Propostas atualmente disponíveis no site.",
      icon: Flag,
    },
    {
      label: "Notícias publicadas",
      value: landing.publishedPosts,
      description:
        "Notícias disponíveis na página pública.",
      icon: FileText,
    },
    {
      label: "Conteúdos públicos",
      value: landing.totalPublicContent,
      description:
        "Total de propostas e notícias publicadas.",
      icon: Globe2,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SummaryCard
        eyebrow="Agenda da campanha"
        title="Desempenho dos eventos"
        description="Acompanhe os compromissos realizados, futuros e o alcance estimado das ações."
        items={agendaItems}
        icon={CalendarClock}
      />

      <SummaryCard
        eyebrow="Presença digital"
        title="Conteúdo e conversão da Landing"
        description="Veja o volume de conteúdo público e os contatos recebidos pelo site da campanha."
        items={landingItems}
        icon={Globe2}
      />
    </div>
  );
}