import {
  BarChart3,
  TrendingUp,
} from "lucide-react";

import type { GrowthDataPoint } from "../types";

type GrowthChartProps = {
  data: GrowthDataPoint[];
};

function getMaximumValue(
  data: GrowthDataPoint[]
): number {
  const values = data.map(
    (item) => item.total
  );

  return Math.max(...values, 1);
}

function getVisibleLabels(
  data: GrowthDataPoint[]
): Set<number> {
  const visibleIndexes = new Set<number>();

  if (data.length <= 10) {
    data.forEach((_, index) => {
      visibleIndexes.add(index);
    });

    return visibleIndexes;
  }

  const desiredLabels = 7;

  for (
    let index = 0;
    index < desiredLabels;
    index += 1
  ) {
    const position = Math.round(
      (index * (data.length - 1)) /
        (desiredLabels - 1)
    );

    visibleIndexes.add(position);
  }

  return visibleIndexes;
}

export default function GrowthChart({
  data,
}: GrowthChartProps) {
  const maximumValue =
    getMaximumValue(data);

  const visibleLabels =
    getVisibleLabels(data);

  const totalRegistrations =
    data.reduce(
      (total, item) =>
        total + item.total,
      0
    );

  const average =
    data.length > 0
      ? totalRegistrations / data.length
      : 0;

  const peak =
    data.reduce<GrowthDataPoint | null>(
      (currentPeak, item) => {
        if (
          !currentPeak ||
          item.total >
            currentPeak.total
        ) {
          return item;
        }

        return currentPeak;
      },
      null
    );

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <TrendingUp className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Evolução da campanha
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Novos apoiadores por dia
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
          <BarChart3 className="h-4 w-4 text-slate-500" />

          <span className="font-bold text-slate-800">
            {totalRegistrations.toLocaleString(
              "pt-BR"
            )}
          </span>

          <span className="text-slate-500">
            cadastros
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
            <TrendingUp className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-950">
            Nenhum dado no período
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Altere os filtros para visualizar
            a evolução dos cadastros.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 border-b border-slate-100 px-6 py-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Total no período
              </p>

              <p className="mt-2 text-2xl font-black text-slate-950">
                {totalRegistrations.toLocaleString(
                  "pt-BR"
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Média diária
              </p>

              <p className="mt-2 text-2xl font-black text-slate-950">
                {average.toLocaleString(
                  "pt-BR",
                  {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  }
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Melhor dia
              </p>

              <p className="mt-2 text-2xl font-black text-slate-950">
                {peak?.total.toLocaleString(
                  "pt-BR"
                ) ?? "0"}
              </p>

              {peak ? (
                <p className="mt-1 text-xs text-slate-500">
                  {peak.label}
                </p>
              ) : null}
            </div>
          </div>

          <div className="overflow-x-auto px-4 py-8 sm:px-6">
            <div className="min-w-[680px]">
              <div className="relative flex h-72 items-end gap-1 border-b border-l border-slate-200 px-3 pt-4">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-3 py-4">
                  {[100, 75, 50, 25, 0].map(
                    (percentage) => (
                      <div
                        key={percentage}
                        className="flex items-center gap-3"
                      >
                        <span className="w-8 text-right text-[10px] font-medium text-slate-400">
                          {Math.round(
                            (maximumValue *
                              percentage) /
                              100
                          )}
                        </span>

                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                    )
                  )}
                </div>

                <div className="relative z-10 ml-10 flex h-full flex-1 items-end gap-1">
                  {data.map(
                    (item, index) => {
                      const height =
                        item.total > 0
                          ? Math.max(
                              (item.total /
                                maximumValue) *
                                100,
                              3
                            )
                          : 1;

                      return (
                        <div
                          key={item.date}
                          className="group relative flex h-full min-w-0 flex-1 items-end"
                        >
                          <div
                            className="w-full rounded-t-lg bg-[#081B33] transition group-hover:bg-[#102A4C]"
                            style={{
                              height: `${height}%`,
                              opacity:
                                item.total === 0
                                  ? 0.12
                                  : 1,
                            }}
                          />

                          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-xl group-hover:block">
                            {item.label}:{" "}
                            {item.total.toLocaleString(
                              "pt-BR"
                            )}
                          </div>

                          {visibleLabels.has(
                            index
                          ) ? (
                            <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-slate-400">
                              {item.label}
                            </span>
                          ) : null}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="h-8" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}