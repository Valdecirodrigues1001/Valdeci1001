"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarRange,
  Filter,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";

import type {
  ReportFilters,
  ReportPeriod,
} from "../types";

type ReportFiltersProps = {
  filters: ReportFilters;
  availableFilters: {
    cities: string[];
    neighborhoods: string[];
    statuses: string[];
  };
};

const periodOptions: Array<{
  value: ReportPeriod;
  label: string;
}> = [
  {
    value: "7d",
    label: "Últimos 7 dias",
  },
  {
    value: "30d",
    label: "Últimos 30 dias",
  },
  {
    value: "90d",
    label: "Últimos 90 dias",
  },
  {
    value: "all",
    label: "Todo o período",
  },
];

const statusLabels: Record<string, string> = {
  lead: "Lead",
  supporter: "Apoiador",
  volunteer: "Voluntário",
  inactive: "Inativo",
};

export default function ReportFiltersComponent({
  filters,
  availableFilters,
}: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(
    field: keyof ReportFilters,
    value: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (!value) {
      params.delete(field);
    } else {
      params.set(field, value);
    }

    if (field === "city") {
      params.delete("neighborhood");
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/dashboard/relatorios?${queryString}`
        : "/dashboard/relatorios"
    );
  }

  function clearFilters() {
    router.push("/dashboard/relatorios");
  }

  const hasActiveFilters =
    filters.period !== "30d" ||
    Boolean(filters.city) ||
    Boolean(filters.neighborhood) ||
    Boolean(filters.status);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Filter className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Análise personalizada
            </p>

            <h2 className="mt-1 text-lg font-black text-slate-950">
              Filtros do relatório
            </h2>
          </div>
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label
            htmlFor="report-period"
            className="text-sm font-bold text-slate-800"
          >
            Período
          </label>

          <div className="relative mt-2">
            <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              id="report-period"
              value={filters.period}
              onChange={(event) =>
                updateFilter(
                  "period",
                  event.target.value
                )
              }
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              {periodOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="report-city"
            className="text-sm font-bold text-slate-800"
          >
            Cidade
          </label>

          <div className="relative mt-2">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              id="report-city"
              value={filters.city ?? ""}
              onChange={(event) =>
                updateFilter(
                  "city",
                  event.target.value
                )
              }
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">
                Todas as cidades
              </option>

              {availableFilters.cities.map(
                (city) => (
                  <option
                    key={city}
                    value={city}
                  >
                    {city}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="report-neighborhood"
            className="text-sm font-bold text-slate-800"
          >
            Bairro
          </label>

          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              id="report-neighborhood"
              value={
                filters.neighborhood ?? ""
              }
              onChange={(event) =>
                updateFilter(
                  "neighborhood",
                  event.target.value
                )
              }
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">
                Todos os bairros
              </option>

              {availableFilters.neighborhoods.map(
                (neighborhood) => (
                  <option
                    key={neighborhood}
                    value={neighborhood}
                  >
                    {neighborhood}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="report-status"
            className="text-sm font-bold text-slate-800"
          >
            Status no CRM
          </label>

          <div className="relative mt-2">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              id="report-status"
              value={filters.status ?? ""}
              onChange={(event) =>
                updateFilter(
                  "status",
                  event.target.value
                )
              }
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">
                Todos os status
              </option>

              {availableFilters.statuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {statusLabels[status] ||
                      status}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}