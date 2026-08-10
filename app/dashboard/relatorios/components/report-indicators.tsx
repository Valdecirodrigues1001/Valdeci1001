import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck2,
  Handshake,
  TrendingUp,
  Users,
} from "lucide-react";

import type { ReportsData } from "../types";

type ReportIndicatorsProps = {
  indicators: ReportsData["indicators"];
};

type IndicatorCard = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

export default function ReportIndicators({
  indicators,
}: ReportIndicatorsProps) {
  const cards: IndicatorCard[] = [
    {
      label: indicators.totalSupporters.label,
      value: indicators.totalSupporters.value,
      description:
        indicators.totalSupporters.description,
      icon: Users,
    },
    {
      label: indicators.newSupporters.label,
      value: indicators.newSupporters.value,
      description:
        indicators.newSupporters.description,
      icon: TrendingUp,
    },
    {
      label: indicators.activeLeaders.label,
      value: indicators.activeLeaders.value,
      description:
        indicators.activeLeaders.description,
      icon: Handshake,
    },
    {
      label: indicators.completedEvents.label,
      value: indicators.completedEvents.value,
      description:
        indicators.completedEvents.description,
      icon: CalendarCheck2,
    },
  ];

  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>

                <p className="mt-3 text-4xl font-semibold tracking-tight text-[#081B33]">
                  {card.value.toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#081B33]/5 text-[#081B33]">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              {card.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}