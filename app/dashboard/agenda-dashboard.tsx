import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import { formatBrasilia } from "@/lib/datetime";

type DashboardEvent = {
  id: string;
  title: string;
  start_at: string;
  location_name: string | null;
  city: string | null;
  status: string;
};

type AgendaDashboardProps = {
  events: DashboardEvent[];
  todayCount: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
};

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusClasses: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  confirmed: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatEventDate(value: string) {
  return {
    day: formatBrasilia(value, {
      day: "2-digit",
    }),

    month: formatBrasilia(value, {
      month: "short",
    })
      .replace(".", "")
      .toUpperCase(),

    time: formatBrasilia(value, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function AgendaDashboard({
  events,
  todayCount,
  pendingFollowUps,
  overdueFollowUps,
}: AgendaDashboardProps) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <CalendarDays size={21} />
            </div>

            <span className="text-3xl font-semibold text-[#081B33]">
              {todayCount}
            </span>
          </div>

          <p className="mt-4 font-semibold text-[#081B33]">
            Compromissos hoje
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Atividades agendadas para o dia.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <CheckCircle2 size={21} />
            </div>

            <span className="text-3xl font-semibold text-[#081B33]">
              {pendingFollowUps}
            </span>
          </div>

          <p className="mt-4 font-semibold text-[#081B33]">
            Acompanhamentos
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Providências que ainda precisam ser realizadas.
          </p>
        </article>

        <article
          className={`rounded-2xl border bg-white p-5 shadow-sm ${
            overdueFollowUps > 0
              ? "border-red-200"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                overdueFollowUps > 0
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <AlertTriangle size={21} />
            </div>

            <span
              className={`text-3xl font-semibold ${
                overdueFollowUps > 0
                  ? "text-red-600"
                  : "text-[#081B33]"
              }`}
            >
              {overdueFollowUps}
            </span>
          </div>

          <p className="mt-4 font-semibold text-[#081B33]">
            Retornos atrasados
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhamentos com o prazo vencido.
          </p>
        </article>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
              Agenda
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#081B33]">
              Próximos compromissos
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Visão rápida das próximas atividades da campanha.
            </p>
          </div>

          <Link
            href="/dashboard/agenda"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-[#081B33] transition hover:bg-slate-50"
          >
            Ver agenda completa
            <ArrowRight size={17} />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <CalendarDays
              size={34}
              className="mx-auto text-slate-300"
            />

            <p className="mt-4 font-semibold text-slate-600">
              Nenhum compromisso futuro
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Os próximos compromissos aparecerão aqui.
            </p>

            <Link
              href="/dashboard/agenda"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#081B33] px-5 text-sm font-semibold text-white transition hover:bg-[#102A4C]"
            >
              Cadastrar compromisso
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {events.map((event) => {
              const date = formatEventDate(event.start_at);

              const location = [
                event.location_name,
                event.city,
              ]
                .filter(Boolean)
                .join(" — ");

              return (
                <Link
                  key={event.id}
                  href={`/dashboard/agenda/${event.id}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-[#081B33]/20 hover:bg-slate-50 sm:flex-row sm:items-center"
                >
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-[#081B33] text-white">
                    <span className="text-xl font-semibold leading-none">
                      {date.day}
                    </span>

                    <span className="mt-1 text-[10px] font-semibold tracking-wider text-[#D4AF37]">
                      {date.month}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClasses[event.status] ??
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabels[event.status] ?? event.status}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Clock3 size={14} />
                        {date.time}
                      </span>
                    </div>

                    <h3 className="mt-2 truncate font-semibold text-[#081B33] transition group-hover:text-[#D4AF37]">
                      {event.title}
                    </h3>

                    {location ? (
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                        <MapPin size={15} />
                        <span className="truncate">
                          {location}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <ArrowRight
                    size={18}
                    className="hidden shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#081B33] sm:block"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}