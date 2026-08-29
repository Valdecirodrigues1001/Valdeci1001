import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  UserMinus,
UserPlus,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventEditForm } from "./event-edit-form";
import { EventCompletionForm } from "./event-completion-form";
import {
  addEventMember,
  removeEventMember,
} from "../actions";
import { EventMemberForm } from "./event-member-form";

type EventDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusClasses: Record<string, string> = {
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  confirmed:
    "border-amber-200 bg-amber-50 text-amber-700",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;

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

 const [
  { data: event },
  { data: leadersData },
  { data: campaignMembersData },
  { data: eventMembersData },
] = await Promise.all([
  supabase
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
  notes,
  actual_audience,
  outcome,
  follow_up_required,
  follow_up_notes,
  follow_up_due_date,
  follow_up_completed_at,
  completed_at
`)
    .eq("id", id)
    .eq("campaign_id", membership.campaign_id)
    .maybeSingle(),

  supabase
    .from("leaders")
    .select("id, full_name")
    .eq("campaign_id", membership.campaign_id)
    .eq("is_active", true)
    .order("full_name"),

  supabase
    .from("campaign_members")
    .select("user_id")
    .eq("campaign_id", membership.campaign_id)
    .eq("is_active", true),

  supabase
    .from("campaign_event_members")
    .select("user_id")
    .eq("event_id", id),
]);

  if (!event) {
    notFound();
  }

  const campaignUserIds = (
  campaignMembersData ?? []
).map((member) => member.user_id);

const eventUserIds = (
  eventMembersData ?? []
).map((member) => member.user_id);

const { data: profilesData } =
  campaignUserIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", campaignUserIds)
    : { data: [] };

const profiles = profilesData ?? [];

const teamMembers = campaignUserIds.map((userId) => {
  const profile = profiles.find(
    (item) => item.id === userId
  );

  return {
    user_id: userId,
    full_name:
      profile?.full_name || "Integrante da equipe",
  };
});

const linkedEventMembers = teamMembers.filter(
  (member) => eventUserIds.includes(member.user_id)
);

const availableEventMembers = teamMembers.filter(
  (member) => !eventUserIds.includes(member.user_id)
);

const addMemberAction = addEventMember.bind(
  null,
  event.id
);

  const leaders = leadersData ?? [];

  const leader = leaders.find(
    (item) => item.id === event.leader_id
  );

  const location = [
    event.location_name,
    event.address,
    event.neighborhood,
    event.city,
  ]
    .filter(Boolean)
    .join(" — ");

  const startDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(event.start_at));

  const startTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(event.start_at));

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1200px]">
        <Link
          href="/dashboard/agenda"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#081B33]"
        >
          <ArrowLeft size={18} />
          Voltar para agenda
        </Link>

        <header className="mt-6 rounded-3xl bg-[#081B33] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  statusClasses[event.status] ??
                  "border-white/20 bg-white/10 text-white"
                }`}
              >
                {statusLabels[event.status] ?? event.status}
              </span>

              <h1 className="mt-4 text-3xl font-semibold">
                {event.title}
              </h1>

              {event.description ? (
                <p className="mt-3 max-w-2xl leading-7 text-white/60">
                  {event.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
              <div className="rounded-2xl bg-white/10 p-4">
                <CalendarDays
                  size={19}
                  className="text-[#D4AF37]"
                />

                <p className="mt-3 text-xs text-white/50">
                  Data
                </p>

                <p className="mt-1 text-sm font-semibold capitalize">
                  {startDate}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <Clock3
                  size={19}
                  className="text-[#D4AF37]"
                />

                <p className="mt-3 text-xs text-white/50">
                  Horário
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {startTime}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <MapPin size={20} className="text-slate-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Local
            </p>

            <p className="mt-1 font-medium text-slate-700">
              {location || "Não informado"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <Users size={20} className="text-slate-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Público estimado
            </p>

            <p className="mt-1 font-medium text-slate-700">
              {event.estimated_audience} pessoas
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <Users size={20} className="text-slate-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Liderança
            </p>

            <p className="mt-1 font-medium text-slate-700">
              {leader?.full_name || "Nenhuma liderança"}
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.7fr]">
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#081B33]/5 text-[#081B33]">
        <UserPlus size={21} />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#081B33]">
          Equipe do compromisso
        </h2>

        <p className="text-sm text-slate-500">
          {linkedEventMembers.length} participantes
          vinculados.
        </p>
      </div>
    </div>

    {linkedEventMembers.length === 0 ? (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
        <p className="font-medium text-slate-600">
          Nenhum integrante vinculado
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Adicione os responsáveis por este compromisso.
        </p>
      </div>
    ) : (
      <div className="mt-6 space-y-3">
        {linkedEventMembers.map((member) => {
          const removeAction =
            removeEventMember.bind(
              null,
              event.id,
              member.user_id
            );

          return (
            <article
              key={member.user_id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#081B33] font-semibold text-white">
                  {member.full_name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <p className="truncate font-semibold text-[#081B33]">
                  {member.full_name}
                </p>
              </div>

              <form action={removeAction}>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <UserMinus size={17} />
                  Remover
                </button>
              </form>
            </article>
          );
        })}
      </div>
    )}
  </div>

  <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-[#081B33]">
      Adicionar integrante
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Selecione uma pessoa da equipe da campanha.
    </p>

    <div className="mt-6">
      <EventMemberForm
        action={addMemberAction}
        members={availableEventMembers}
      />
    </div>
  </aside>
</section>

<section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
  <div>
    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
      Resultado da atividade
    </p>

    <h2 className="mt-2 text-2xl font-semibold text-[#081B33]">
      Encerramento do compromisso
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Registre o público presente, os resultados alcançados
      e as próximas providências.
    </p>
  </div>

  <div className="mt-8">
    <EventCompletionForm
      eventId={event.id}
      estimatedAudience={event.estimated_audience}
      actualAudience={event.actual_audience}
      outcome={event.outcome}
      followUpDueDate={event.follow_up_due_date}
      followUpRequired={
        event.follow_up_required ?? false
      }
      followUpNotes={event.follow_up_notes}
      status={event.status}
    />
  </div>
</section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
              Edição
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#081B33]">
              Dados do compromisso
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Atualize as informações do compromisso.
            </p>
          </div>

          <div className="mt-8">
            <EventEditForm
              event={event}
              leaders={leaders}
            />
          </div>
        </section>
      </div>
    </main>
  );
}