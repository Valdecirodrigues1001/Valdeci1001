import {
  ArrowLeft,
  CalendarDays,
  Handshake,
  History,
  MapPin,
  MessageCircle,
  Network,
  UserRound,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActivityForm } from "./activity-form";
import { LeaderEditForm } from "./leader-edit-form";
import { LinkSupporterForm } from "./link-supporter-form";
import { unlinkSupporter } from "./actions";

type LeaderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Activity = {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
};

type Supporter = {
  id: string;
  full_name: string;
  whatsapp: string | null;
  city: string | null;
  neighborhood: string | null;
  leader_id: string | null;
};

const activityLabels: Record<string, string> = {
  created: "Cadastro",
  updated: "Atualização",
  contact: "Contato",
  meeting: "Reunião",
  event_participation: "Evento",
  supporter_linked: "Vinculação",
  supporter_unlinked: "Desvinculação",
  note: "Observação",
};

export default async function LeaderDetailPage({
  params,
}: LeaderPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: membership } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const { data: leader } = await supabase
    .from("leaders")
    .select("*")
    .eq("id", id)
    .eq("campaign_id", membership.campaign_id)
    .maybeSingle();

  if (!leader) {
    notFound();
  }

  const [
    { data: parentLeadersData },
    { data: supportersData },
    { data: activitiesData },
  ] = await Promise.all([
    supabase
      .from("leaders")
      .select("id, full_name")
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .neq("id", id)
      .order("full_name"),

    supabase
      .from("supporters")
      .select(`
        id,
        full_name,
        whatsapp,
        city,
        neighborhood,
        leader_id
      `)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .order("full_name"),

    supabase
      .from("leader_activities")
      .select(`
        id,
        activity_type,
        title,
        description,
        created_at
      `)
      .eq("leader_id", id)
      .eq("campaign_id", membership.campaign_id)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  const supporters = (supportersData ?? []) as Supporter[];

  const linkedSupporters = supporters.filter(
    (supporter) => supporter.leader_id === id
  );

  const availableSupporters = supporters.filter(
    (supporter) => supporter.leader_id !== id
  );

  const parentLeaders = parentLeadersData ?? [];
  const activities = (activitiesData ?? []) as Activity[];

  const parentLeader = parentLeaders.find(
    (item) => item.id === leader.parent_leader_id
  );

  const achievementPercentage =
    leader.estimated_supporters > 0
      ? Math.min(
          100,
          Math.round(
            (linkedSupporters.length /
              leader.estimated_supporters) *
              100
          )
        )
      : 0;

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/dashboard/liderancas"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#081B33]"
        >
          <ArrowLeft size={18} />
          Voltar para lideranças
        </Link>

        <header className="mt-6 rounded-3xl bg-[#081B33] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-2xl font-bold text-[#081B33]">
                {leader.full_name.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                  Ficha da liderança
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                  {leader.full_name}
                </h1>

                <p className="mt-2 text-white/60">
                  {leader.area_of_influence ||
                    leader.profession ||
                    "Área de influência não informada"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 px-5 py-4">
                <p className="text-xs text-white/50">
                  Apoiadores
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {linkedSupporters.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4">
                <p className="text-xs text-white/50">
                  Potencial
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {leader.estimated_supporters}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4">
                <p className="text-xs text-white/50">
                  Alcance da meta
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {achievementPercentage}%
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <MessageCircle size={20} className="text-slate-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Contato
            </p>

            <p className="mt-1 truncate font-medium text-slate-700">
              {leader.whatsapp ||
                leader.phone ||
                "Não informado"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <MapPin size={20} className="text-slate-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Localização
            </p>

            <p className="mt-1 truncate font-medium text-slate-700">
              {[leader.neighborhood, leader.city]
                .filter(Boolean)
                .join(", ") || "Não informada"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <Network size={20} className="text-slate-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Responsável
            </p>

            <p className="mt-1 truncate font-medium text-slate-700">
              {parentLeader?.full_name || "Liderança direta"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <CalendarDays size={20} className="text-slate-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Cadastro
            </p>

            <p className="mt-1 font-medium text-slate-700">
              {new Intl.DateTimeFormat("pt-BR").format(
                new Date(leader.created_at)
              )}
            </p>
          </article>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#081B33]/5 text-[#081B33]">
                  <UserRound size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[#081B33]">
                    Dados da liderança
                  </h2>

                  <p className="text-sm text-slate-500">
                    Atualize as informações sempre que necessário.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <LeaderEditForm
                  leader={leader}
                  parentLeaders={parentLeaders}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <Users size={22} className="text-[#081B33]" />

                <div>
                  <h2 className="text-xl font-semibold text-[#081B33]">
                    Apoiadores da liderança
                  </h2>

                  <p className="text-sm text-slate-500">
                    {linkedSupporters.length} pessoas vinculadas.
                  </p>
                </div>
              </div>

              {linkedSupporters.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <Handshake
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-medium text-slate-600">
                    Nenhum apoiador vinculado
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Utilize o formulário ao lado para formar a rede
                    desta liderança.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {linkedSupporters.map((supporter) => {
                    const unlinkAction = unlinkSupporter.bind(
                      null,
                      leader.id,
                      supporter.id
                    );

                    return (
                      <article
                        key={supporter.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <Link
                          href={`/dashboard/apoiadores/${supporter.id}`}
                          className="flex min-w-0 items-center gap-3"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#081B33] font-semibold text-white">
                            {supporter.full_name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#081B33]">
                              {supporter.full_name}
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {[supporter.neighborhood, supporter.city]
                                .filter(Boolean)
                                .join(", ") ||
                                supporter.whatsapp ||
                                "Dados não informados"}
                            </p>
                          </div>
                        </Link>

                        <form action={unlinkAction}>
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <UserX size={17} />
                            Desvincular
                          </button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#081B33]">
                Vincular apoiador
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Selecione uma pessoa cadastrada para integrar a rede
                desta liderança.
              </p>

              <div className="mt-6">
                <LinkSupporterForm
                  leaderId={leader.id}
                  supporters={availableSupporters}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#081B33]">
                Nova atividade
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Registre contatos, reuniões e movimentações.
              </p>

              <div className="mt-6">
                <ActivityForm leaderId={leader.id} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <History size={21} className="text-[#081B33]" />

                <h2 className="text-xl font-semibold text-[#081B33]">
                  Histórico
                </h2>
              </div>

              {activities.length === 0 ? (
                <p className="mt-6 text-sm text-slate-400">
                  Nenhuma atividade registrada.
                </p>
              ) : (
                <div className="mt-6 space-y-5">
                  {activities.map((activity) => (
                    <article
                      key={activity.id}
                      className="border-l-2 border-[#D4AF37] pl-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                            {activityLabels[
                              activity.activity_type
                            ] ?? "Atividade"}
                          </span>

                          <h3 className="mt-1 font-semibold text-slate-800">
                            {activity.title}
                          </h3>
                        </div>

                        <time className="shrink-0 text-xs text-slate-400">
                          {new Intl.DateTimeFormat("pt-BR").format(
                            new Date(activity.created_at)
                          )}
                        </time>
                      </div>

                      {activity.description ? (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {activity.description}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}