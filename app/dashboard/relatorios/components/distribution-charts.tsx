import {
  CircleDot,
  PieChart,
  UsersRound,
} from "lucide-react";

import type {
  OriginDataPoint,
  StatusDataPoint,
} from "../types";

type DistributionChartsProps = {
  origins: OriginDataPoint[];
  statuses: StatusDataPoint[];
};

type DistributionItem = {
  key: string;
  label: string;
  total: number;
  percentage: number;
};

type DistributionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: DistributionItem[];
  emptyMessage: string;
  icon: typeof PieChart;
};

function DistributionCard({
  eyebrow,
  title,
  description,
  items,
  emptyMessage,
  icon: Icon,
}: DistributionCardProps) {
  const total = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const maximumValue = Math.max(
    ...items.map((item) => item.total),
    1
  );

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
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
            <CircleDot className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-950">
            Nenhum dado encontrado
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Total analisado
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {total.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="space-y-5 p-6">
            {items.map((item) => {
              const relativeWidth =
                item.total > 0
                  ? Math.max(
                      (item.total / maximumValue) *
                        100,
                      3
                    )
                  : 0;

              return (
                <article key={item.key}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.total.toLocaleString(
                          "pt-BR"
                        )}{" "}
                        {item.total === 1
                          ? "cadastro"
                          : "cadastros"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#081B33] transition-all duration-500"
                      style={{
                        width: `${relativeWidth}%`,
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default function DistributionCharts({
  origins,
  statuses,
}: DistributionChartsProps) {
  const originItems: DistributionItem[] =
    origins.map((item) => ({
      key: item.origin,
      label: item.label,
      total: item.total,
      percentage: item.percentage,
    }));

  const statusItems: DistributionItem[] =
    statuses.map((item) => ({
      key: item.status,
      label: item.label,
      total: item.total,
      percentage: item.percentage,
    }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DistributionCard
        eyebrow="Aquisição"
        title="Origem dos apoiadores"
        description="Identifique quais canais estão trazendo mais contatos para a campanha."
        items={originItems}
        emptyMessage="Não existem origens registradas para os filtros selecionados."
        icon={PieChart}
      />

      <DistributionCard
        eyebrow="CRM político"
        title="Situação dos contatos"
        description="Acompanhe a distribuição dos contatos entre leads, apoiadores e voluntários."
        items={statusItems}
        emptyMessage="Não existem status registrados para os filtros selecionados."
        icon={UsersRound}
      />
    </div>
  );
}