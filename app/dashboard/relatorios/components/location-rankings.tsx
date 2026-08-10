import {
  Building2,
  MapPin,
} from "lucide-react";

import type {
  LocationDataPoint,
} from "../types";

type LocationRankingsProps = {
  cities: LocationDataPoint[];
  neighborhoods: LocationDataPoint[];
};

type RankingCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: LocationDataPoint[];
  emptyMessage: string;
  icon: typeof MapPin;
};

function RankingCard({
  eyebrow,
  title,
  description,
  items,
  emptyMessage,
  icon: Icon,
}: RankingCardProps) {
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
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
            <Icon className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-950">
            Nenhum dado encontrado
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item, index) => {
            const relativeWidth =
              item.total > 0
                ? Math.max(
                    (item.total / maximumValue) * 100,
                    4
                  )
                : 0;

            return (
              <article
                key={item.name}
                className="px-6 py-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-700">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-slate-900">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.total.toLocaleString("pt-BR")}{" "}
                          {item.total === 1
                            ? "apoiador"
                            : "apoiadores"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                        {item.percentage}%
                      </span>
                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#081B33] transition-all duration-500"
                        style={{
                          width: `${relativeWidth}%`,
                        }}
                      />
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

export default function LocationRankings({
  cities,
  neighborhoods,
}: LocationRankingsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <RankingCard
        eyebrow="Distribuição territorial"
        title="Cidades com mais apoiadores"
        description="Visualize os municípios onde a campanha possui maior presença cadastrada."
        items={cities}
        emptyMessage="Nenhuma cidade foi informada nos cadastros encontrados."
        icon={MapPin}
      />

      <RankingCard
        eyebrow="Presença local"
        title="Bairros com mais apoiadores"
        description="Identifique os bairros com maior concentração de contatos da campanha."
        items={neighborhoods}
        emptyMessage="Nenhum bairro foi informado nos cadastros encontrados."
        icon={Building2}
      />
    </div>
  );
}