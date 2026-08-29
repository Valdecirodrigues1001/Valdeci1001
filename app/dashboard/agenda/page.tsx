import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  deleteCampaignEvent,
  updateEventStatus,
} from "./actions";
import { EventForm } from "./event-form";
import { EventStatusForm } from "./event-status-form";

type AgendaPageProps = {
  searchParams: Promise<{
    status?: string;
    period?: string;
  }>;
};

type CampaignEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  start_at: string;
  end_at: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  location_name: string | null;
  estimated_audience: number;
  leader_id: string | null;
  notes: string | null;
};

type Leader = {
  id: string;
  full_name: string;
};

const eventTypeLabels: Record<string, string> = {
  meeting: "Reunião",
  visit: "Visita",
  event: "Evento",
  interview: "Entrevista",
  mobilization: "Mobilização",
  internal: "Interno",
  other: "Outro",
};

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusClasses: Record<string, string> = {
  scheduled:
    "border-blue-200 bg-blue-50 text-blue-700",
  confirmed:
    "border-amber-200 bg-amber-50 text-amber-700",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled:
    "border-red-200 bg-red-50 text-red-700",
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AgendaPage({
  searchParams,
}: AgendaPageProps) {
  const filters = await searchParams;

  const selectedStatus = filters.status ?? "all";
  const selectedPeriod = filters.period ?? "upcoming";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/login");
  }

  const now = new Date();

  let eventsQuery = supabase
    .from("campaign_events")
    .select(`
      id,
      title,
      description,
      event_type,
      status,
      start_at,
      end_at,
      city,
      neighborhood,
      address,
      location_name,
      estimated_audience,
      leader_id,
      notes
    `)
    .eq("campaign_id", membership.campaign_id);

  if (selectedStatus !== "all") {
    eventsQuery = eventsQuery.eq(
      "status",
      selectedStatus
    );
  }

  if (selectedPeriod === "upcoming") {
    eventsQuery = eventsQuery.gte(
      "start_at",
      now.toISOString()
    );
  }

  if (selectedPeriod === "past") {
    eventsQuery = eventsQuery.lt(
      "start_at",
      now.toISOString()
    );
  }

  const [
    { data: eventsData, error: eventsError },
    { data: leadersData },
    { data: allEventsData },
  ] = await Promise.all([
    eventsQuery.order("start_at", {
      ascending: selectedPeriod !== "past",
    }),

    supabase
      .from("leaders")
      .select("id, full_name")
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .order("full_name"),

    supabase
      .from("campaign_events")
      .select("id, status, start_at, estimated_audience")
      .eq("campaign_id", membership.campaign_id),
  ]);

  if (eventsError) {
    console.error(
      "Erro ao carregar agenda:",
      eventsError
    );
  }

  const events = (eventsData ?? []) as CampaignEvent[];
  const leaders = (leadersData ?? []) as Leader[];
  const allEvents = allEventsData ?? [];

  const upcomingEvents = allEvents.filter(
    (event) =>
      new Date(event.start_at).getTime() >=
        now.getTime() &&
      event.status !== "cancelled"
  );

  const confirmedEvents = upcomingEvents.filter(
    (event) => event.status === "confirmed"
  );

  const completedEvents = allEvents.filter(
    (event) => event.status === "completed"
  );

  const estimatedAudience = upcomingEvents.reduce(
    (total, event) =>
      total + (event.estimated_audience ?? 0),
    0
  );

  const leaderNameById = new Map(
    leaders.map((leader) => [
      leader.id,
      leader.full_name,
    ])
  );

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
              Organização da campanha
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#081B33] sm:text-4xl">
              Agenda
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Organize reuniões, visitas, eventos,
              entrevistas e ações de mobilização.
            </p>
          </div>

          <Link
  href="/dashboard/agenda/acompanhamentos"
  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-[#081B33] transition hover:bg-slate-50"
>
  <CheckCircle2 size={18} />
  Acompanhamentos
</Link>

          <a
            href="#novo-compromisso"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#081B33] px-6 font-semibold text-white transition hover:bg-[#102A4C]"
          >
            <Plus size={18} />
            Novo compromisso
          </a>

          
        </header>


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarDays
              size={22}
              className="text-blue-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Próximos compromissos
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#081B33]">
              {upcomingEvents.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarCheck
              size={22}
              className="text-amber-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Confirmados
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#081B33]">
              {confirmedEvents.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2
              size={22}
              className="text-emerald-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Concluídos
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#081B33]">
              {completedEvents.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users
              size={22}
              className="text-[#D4AF37]"
            />

            <p className="mt-4 text-sm text-slate-500">
              Público estimado
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#081B33]">
              {estimatedAudience}
            </p>
          </article>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="min-w-0">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#081B33]">
                    Compromissos
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {events.length} registros encontrados.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/agenda?period=${selectedPeriod}&status=all`}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      selectedStatus === "all"
                        ? "border-[#081B33] bg-[#081B33] text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Todos
                  </Link>

                  <Link
                    href={`/dashboard/agenda?period=${selectedPeriod}&status=scheduled`}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      selectedStatus === "scheduled"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Agendados
                  </Link>

                  <Link
                    href={`/dashboard/agenda?period=${selectedPeriod}&status=confirmed`}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      selectedStatus === "confirmed"
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Confirmados
                  </Link>

                  <Link
                    href={`/dashboard/agenda?period=${selectedPeriod}&status=completed`}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      selectedStatus === "completed"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Concluídos
                  </Link>
                </div>
              </div>

              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-5">
                <Link
                  href={`/dashboard/agenda?period=upcoming&status=${selectedStatus}`}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    selectedPeriod === "upcoming"
                      ? "bg-slate-100 text-[#081B33]"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Próximos
                </Link>

                <Link
                  href={`/dashboard/agenda?period=all&status=${selectedStatus}`}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    selectedPeriod === "all"
                      ? "bg-slate-100 text-[#081B33]"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Todos
                </Link>

                <Link
                  href={`/dashboard/agenda?period=past&status=${selectedStatus}`}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    selectedPeriod === "past"
                      ? "bg-slate-100 text-[#081B33]"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Anteriores
                </Link>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <CalendarDays
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-semibold text-slate-700">
                  Nenhum compromisso encontrado
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Cadastre um compromisso ou altere os
                  filtros da agenda.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {events.map((event) => {
                  const updateStatusAction =
                    updateEventStatus.bind(
                      null,
                      event.id
                    );

                  const deleteAction =
                    deleteCampaignEvent.bind(
                      null,
                      event.id
                    );

                  const leaderName = event.leader_id
                    ? leaderNameById.get(
                        event.leader_id
                      )
                    : null;

                  const location = [
                    event.location_name,
                    event.neighborhood,
                    event.city,
                  ]
                    .filter(Boolean)
                    .join(" — ");

                  return (
                    <article
                      key={event.id}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#081B33]/5 px-3 py-1 text-xs font-semibold text-[#081B33]">
                              {eventTypeLabels[
                                event.event_type
                              ] ?? "Compromisso"}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                statusClasses[
                                  event.status
                                ] ??
                                "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {statusLabels[
                                event.status
                              ] ?? event.status}
                            </span>
                          </div>

                          <Link
  href={`/dashboard/agenda/${event.id}`}
  className="mt-4 block text-xl font-semibold text-[#081B33] transition hover:text-[#D4AF37]"
>
  {event.title}
</Link>

                          {event.description ? (
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {event.description}
                            </p>
                          ) : null}

                          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays
                                size={17}
                              />
                              {formatEventDate(
                                event.start_at
                              )}
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <Clock3 size={17} />
                              {formatEventTime(
                                event.start_at
                              )}

                              {event.end_at
                                ? ` até ${formatEventTime(
                                    event.end_at
                                  )}`
                                : ""}
                            </span>

                            {location ? (
                              <span className="inline-flex items-center gap-2">
                                <MapPin size={17} />
                                {location}
                              </span>
                            ) : null}

                            {event.estimated_audience >
                            0 ? (
                              <span className="inline-flex items-center gap-2">
                                <Users size={17} />
                                {
                                  event.estimated_audience
                                }{" "}
                                pessoas
                              </span>
                            ) : null}
                          </div>

                          {leaderName ? (
                            <p className="mt-4 text-sm text-slate-500">
                              Liderança vinculada:{" "}
                              <span className="font-semibold text-slate-700">
                                {leaderName}
                              </span>
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
  <EventStatusForm
    action={updateStatusAction}
    status={event.status}
  />

  <form action={deleteAction}>
    <button
      type="submit"
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
    >
      <Trash2 size={16} />
      Excluir
    </button>
  </form>
</div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside
            id="novo-compromisso"
            className="scroll-mt-24"
          >
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#9A7A12]">
                  <Plus size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[#081B33]">
                    Novo compromisso
                  </h2>

                

                  <p className="text-sm text-slate-500">
                    Adicione uma atividade à agenda.
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <EventForm leaders={leaders} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}