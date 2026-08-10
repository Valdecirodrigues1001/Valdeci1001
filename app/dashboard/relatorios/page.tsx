import { BarChart3 } from "lucide-react";

import {
  getReportsData,
} from "./actions";

import AgendaLandingSummary from "./components/agenda-landing-summary";
import DistributionCharts from "./components/distribution-charts";
import GrowthChart from "./components/growth-chart";
import LeadersRanking from "./components/leaders-ranking";
import LocationRankings from "./components/location-rankings";
import ReportFiltersComponent from "./components/report-filters";
import ReportIndicators from "./components/report-indicators";
import ExportReportButton from "./components/export-report-button";


import type {
  ReportFilters,
  ReportPeriod,
} from "./types";

type ReportsPageProps = {
  searchParams: Promise<{
    period?: string;
    city?: string;
    neighborhood?: string;
    status?: string;
  }>;
};

const validPeriods: ReportPeriod[] = [
  "7d",
  "30d",
  "90d",
  "all",
];

function parsePeriod(
  value: string | undefined
): ReportPeriod {
  if (
    value &&
    validPeriods.includes(
      value as ReportPeriod
    )
  ) {
    return value as ReportPeriod;
  }

  return "30d";
}

function parseOptionalFilter(
  value: string | undefined
): string | null {
  const normalized = value?.trim();

  return normalized || null;
}

export default async function ReportsPage({
  searchParams,
}: ReportsPageProps) {
  const params = await searchParams;

  const filters: ReportFilters = {
    period: parsePeriod(
      params.period
    ),

    city: parseOptionalFilter(
      params.city
    ),

    neighborhood:
      parseOptionalFilter(
        params.neighborhood
      ),

    status: parseOptionalFilter(
      params.status
    ),
  };

  const reports =
    await getReportsData(filters);

  return (
    <main className="min-h-screen bg-slate-50 px-5 pb-10 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Inteligência da campanha
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#081B33] sm:text-4xl">
              Relatórios estratégicos
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Analise o crescimento da campanha, a origem dos contatos,
              a distribuição territorial, o desempenho das lideranças
              e os resultados da presença digital.
            </p>
          </div>

          <ExportReportButton />
        </header>

        <div className="mt-8">
          <ReportFiltersComponent
            filters={filters}
            availableFilters={
              reports.availableFilters
            }
          />
        </div>

        <div className="mt-6">
          <ReportIndicators
            indicators={
              reports.indicators
            }
          />
        </div>

        <div className="mt-6">
          <GrowthChart
            data={reports.growth}
          />
        </div>

        <div className="mt-6">
          <DistributionCharts
            origins={reports.origins}
            statuses={reports.statuses}
          />
        </div>

        <div className="mt-6">
          <LocationRankings
            cities={reports.cities}
            neighborhoods={
              reports.neighborhoods
            }
          />
        </div>

        <div className="mt-6">
          <LeadersRanking
            leaders={reports.leaders}
          />
        </div>

        <div className="mt-6">
          <AgendaLandingSummary
            agenda={reports.agenda}
            landing={reports.landing}
          />
        </div>

        <footer className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-900">
                Dados atualizados automaticamente
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Os indicadores são calculados com base nos registros atuais
                da campanha e respeitam os filtros selecionados acima.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}