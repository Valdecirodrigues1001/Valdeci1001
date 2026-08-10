import {
  Handshake,
  MapPin,
  Users,
} from "lucide-react";

import type {
  LeaderReportItem,
} from "../types";

type LeadersRankingProps = {
  leaders: LeaderReportItem[];
};

function getLocation(
  leader: LeaderReportItem
): string {
  return [
    leader.city,
    leader.neighborhood,
  ]
    .filter(Boolean)
    .join(" - ");
}

export default function LeadersRanking({
  leaders,
}: LeadersRankingProps) {
  const totalEstimatedSupporters =
    leaders.reduce(
      (sum, leader) =>
        sum +
        (leader.estimated_supporters ?? 0),
      0
    );

  const maximumValue = Math.max(
    ...leaders.map(
      (leader) =>
        leader.estimated_supporters ?? 0
    ),
    1
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Handshake className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Força política
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Lideranças por alcance estimado
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Compare as lideranças ativas e sua estimativa de apoiadores.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Alcance estimado
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950">
            {totalEstimatedSupporters.toLocaleString(
              "pt-BR"
            )}
          </p>
        </div>
      </div>

      {leaders.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
            <Handshake className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-950">
            Nenhuma liderança encontrada
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Cadastre lideranças ativas para acompanhar o alcance estimado da campanha.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {leaders.map(
            (leader, index) => {
              const estimatedSupporters =
                leader.estimated_supporters ??
                0;

              const relativeWidth =
                estimatedSupporters > 0
                  ? Math.max(
                      (estimatedSupporters /
                        maximumValue) *
                        100,
                      4
                    )
                  : 0;

              const location =
                getLocation(leader);

              return (
                <article
                  key={leader.id}
                  className="px-6 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-700">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-950">
                            {leader.full_name}
                          </h3>

                          {location ? (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {location}
                            </p>
                          ) : null}

                          {leader.area_of_influence ? (
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {
                                leader.area_of_influence
                              }
                            </p>
                          ) : null}
                        </div>

                        <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-right">
                          <p className="flex items-center justify-end gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            <Users className="h-3.5 w-3.5" />
                            Estimativa
                          </p>

                          <p className="mt-1 text-xl font-black text-slate-950">
                            {estimatedSupporters.toLocaleString(
                              "pt-BR"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
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
            }
          )}
        </div>
      )}
    </section>
  );
}