import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  ClipboardList,
  History,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Pencil,
  Phone,
  Star,
  UserRound,
  Users,
} from "lucide-react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityForm } from "./activity-form";
import { SupporterEditForm } from "./supporter-edit-form";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/campaign-access";
import { hasPermission } from "@/lib/permissions";

type SupporterPageProps = {
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

const activityLabels: Record<string, string> = {
  created: "Cadastro",
  updated: "Atualização",
  event_participation: "Evento",
  material_request: "Material",
  became_volunteer: "Voluntário",
  contact: "Contato",
  note: "Observação",
  visit: "Visita",
  whatsapp: "WhatsApp",
  crm_stage_changed: "Mudança no CRM",
};

function getActivityIcon(type: string) {
  switch (type) {
    case "contact":
      return (
        <Phone
          size={18}
          className="text-blue-600"
        />
      );

    case "whatsapp":
      return (
        <MessageSquare
          size={18}
          className="text-green-600"
        />
      );

    case "visit":
      return (
        <MapPin
          size={18}
          className="text-orange-600"
        />
      );

    case "event_participation":
      return (
        <Calendar
          size={18}
          className="text-purple-600"
        />
      );

    case "material_request":
      return (
        <Package
          size={18}
          className="text-amber-600"
        />
      );

    case "became_volunteer":
      return (
        <Users
          size={18}
          className="text-emerald-600"
        />
      );

    case "crm_stage_changed":
      return (
        <Star
          size={18}
          className="text-yellow-500"
        />
      );

    case "updated":
      return (
        <Pencil
          size={18}
          className="text-slate-500"
        />
      );

    default:
      return (
        <ClipboardList
          size={18}
          className="text-slate-500"
        />
      );
  }
}

const crmStageLabels: Record<
  string,
  string
> = {
  new: "Novo contato",
  contact: "Primeiro contato",
  negotiation: "Em acompanhamento",
  confirmed: "Apoio confirmado",
  volunteer: "Voluntário",
  leader: "Liderança",
};

const supporterStatusLabels: Record<
  string,
  string
> = {
  lead: "Contato inicial",
  supporter: "Apoiador",
  volunteer: "Voluntário",
  inactive: "Inativo",
};

const originLabels: Record<
  string,
  string
> = {
  landing_page: "Landing Page",
  manual: "Cadastro manual",
  event: "Evento",
  referral: "Indicação",
  social_media: "Rede social",
  other: "Outro",
};

export default async function SupporterDetailPage({
  params,
}: SupporterPageProps) {
  /*
   * Protege a página.
   */
  const access =
    await requirePermission(
      "supporters.view"
    );

  /*
   * Define se o usuário pode editar
   * dados e registrar atividades.
   */
  const canManageSupporters =
    hasPermission(
      access.role,
      "supporters.manage"
    );

  const { id } = await params;

  const supabase = await createClient();

  const {
    data: supporter,
    error: supporterError,
  } = await supabase
    .from("supporters")
    .select(`
      *,
      campaign_areas (
        id,
        name
      ),
      mobilization_teams (
        id,
        name
      )
    `)
    .eq("id", id)
    .eq(
      "campaign_id",
      access.campaignId
    )
    .is("deleted_at", null)
    .maybeSingle();

  if (supporterError) {
    console.error(
      "Erro ao buscar apoiador:",
      supporterError
    );
  }

  if (!supporter) {
    notFound();
  }

  let assignedMemberName:
    | string
    | null = null;

  let assignedMemberJobTitle:
    | string
    | null = null;

  if (supporter.assigned_member_id) {
    const { data: assignedMember } =
      await supabase
        .from("campaign_members")
        .select(`
          id,
          user_id,
          job_title
        `)
        .eq(
          "id",
          supporter.assigned_member_id
        )
        .eq(
          "campaign_id",
          access.campaignId
        )
        .maybeSingle();

    if (assignedMember) {
      const {
        data: assignedProfile,
      } = await supabase
        .from("profiles")
        .select("full_name")
        .eq(
          "id",
          assignedMember.user_id
        )
        .maybeSingle();

      assignedMemberName =
        assignedProfile?.full_name ??
        "Integrante";

      assignedMemberJobTitle =
        assignedMember.job_title ?? null;
    }
  }

  const { data: activitiesData } =
    await supabase
      .from("supporter_activities")
      .select(`
        id,
        activity_type,
        title,
        description,
        created_at
      `)
      .eq(
        "supporter_id",
        id
      )
      .eq(
        "campaign_id",
        access.campaignId
      )
      .order("created_at", {
        ascending: false,
      });

  const activities =
    (activitiesData ?? []) as Activity[];

  const areaName =
    supporter.campaign_areas?.name ??
    "Área não definida";

  const teamName =
    supporter.mobilization_teams?.name ??
    "Equipe não definida";

  const crmStageLabel =
    crmStageLabels[
      supporter.crm_stage
    ] ?? "Novo contato";

  const supporterStatusLabel =
    supporterStatusLabels[
      supporter.status
    ] ?? "Não definido";

  const nextContactLabel =
    supporter.next_contact_at
      ? new Intl.DateTimeFormat(
          "pt-BR",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        ).format(
          new Date(
            supporter.next_contact_at
          )
        )
      : "Não agendado";

  const lastContactLabel =
    supporter.last_contact_at
      ? new Intl.DateTimeFormat(
          "pt-BR",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        ).format(
          new Date(
            supporter.last_contact_at
          )
        )
      : "Sem registro";

  const originLabel =
    originLabels[
      supporter.origin
    ] ?? "Não informada";

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/dashboard/apoiadores"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#081B33]"
        >
          <ArrowLeft size={18} />
          Voltar para apoiadores
        </Link>

        <header className="mt-6 rounded-3xl bg-[#081B33] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-2xl font-bold text-[#081B33]">
                {supporter.full_name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                  Ficha do apoiador
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                  {supporter.full_name}
                </h1>

                <p className="mt-2 text-white/60">
                  {supporter.profession ||
                    "Profissão não informada"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-white/50">
                  Etapa do CRM
                </p>

                <p className="mt-1 text-sm font-medium">
                  {crmStageLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-white/50">
                  Equipe
                </p>

                <p className="mt-1 text-sm font-medium">
                  {teamName}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-white/50">
                  Responsável
                </p>

                <p className="mt-1 text-sm font-medium">
                  {assignedMemberName ??
                    "Não definido"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-white/50">
                  Próximo contato
                </p>

                <p className="mt-1 text-sm font-medium">
                  {nextContactLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        {!canManageSupporters ? (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
            <p className="text-sm font-medium text-blue-800">
              Você possui acesso somente
              para visualização deste
              apoiador.
            </p>
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <MessageCircle
              size={20}
              className="text-slate-400"
            />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Telefone
            </p>

            <p className="mt-1 truncate font-medium text-slate-700">
              {supporter.whatsapp ||
                supporter.phone ||
                "Não informado"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <Mail
              size={20}
              className="text-slate-400"
            />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              E-mail
            </p>

            <p className="mt-1 truncate font-medium text-slate-700">
              {supporter.email ||
                "Não informado"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <MapPin
              size={20}
              className="text-slate-400"
            />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Localização
            </p>

            <p className="mt-1 truncate font-medium text-slate-700">
              {[
                supporter.neighborhood,
                supporter.city,
              ]
                .filter(Boolean)
                .join(", ") ||
                "Não informada"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <CalendarDays
              size={20}
              className="text-slate-400"
            />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
              Cadastro
            </p>

            <p className="mt-1 font-medium text-slate-700">
              {new Intl.DateTimeFormat(
                "pt-BR"
              ).format(
                new Date(
                  supporter.created_at
                )
              )}
            </p>
          </article>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#081B33]/5 text-[#081B33]">
                <UserRound size={21} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#081B33]">
                  Dados do apoiador
                </h2>

                <p className="text-sm text-slate-500">
                  {canManageSupporters
                    ? "Atualize as informações sempre que necessário."
                    : "Consulte as informações cadastradas deste apoiador."}
                </p>
              </div>
            </div>

            <div className="mt-8">
              {canManageSupporters ? (
                <SupporterEditForm
                  supporter={supporter}
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <ReadOnlyField
                    label="Nome"
                    value={
                      supporter.full_name
                    }
                  />

                  <ReadOnlyField
                    label="Profissão"
                    value={
                      supporter.profession
                    }
                  />

                  <ReadOnlyField
                    label="WhatsApp"
                    value={
                      supporter.whatsapp
                    }
                  />

                  <ReadOnlyField
                    label="Telefone"
                    value={
                      supporter.phone
                    }
                  />

                  <ReadOnlyField
                    label="E-mail"
                    value={
                      supporter.email
                    }
                  />

                  <ReadOnlyField
                    label="Cidade"
                    value={
                      supporter.city
                    }
                  />

                  <ReadOnlyField
                    label="Bairro"
                    value={
                      supporter.neighborhood
                    }
                  />

                  <ReadOnlyField
                    label="Status"
                    value={
                      supporterStatusLabel
                    }
                  />
                </div>
              )}
            </div>
          </section>

          <div className="space-y-8">
            {canManageSupporters ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#081B33]">
                  Nova atividade
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registre contatos, pedidos
                  e participações.
                </p>

                <div className="mt-6">
                  <ActivityForm
                    supporterId={
                      supporter.id
                    }
                  />
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-semibold text-[#081B33]">
                  Relacionamento
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Visão estratégica deste
                  apoiador.
                </p>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                <InfoRow
                  label="Status"
                  value={
                    supporterStatusLabel
                  }
                />

                <InfoRow
                  label="Etapa do CRM"
                  value={crmStageLabel}
                />

                <InfoRow
                  label="Área"
                  value={areaName}
                />

                <InfoRow
                  label="Equipe"
                  value={teamName}
                />

                <div className="flex items-start justify-between gap-4 py-4">
                  <p className="text-sm text-slate-500">
                    Responsável
                  </p>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#081B33]">
                      {assignedMemberName ??
                        "Não definido"}
                    </p>

                    {assignedMemberJobTitle ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {
                          assignedMemberJobTitle
                        }
                      </p>
                    ) : null}
                  </div>
                </div>

                <InfoRow
                  label="Origem"
                  value={originLabel}
                />

                <InfoRow
                  label="Último contato"
                  value={lastContactLabel}
                />

                <InfoRow
                  label="Próximo contato"
                  value={nextContactLabel}
                />

                <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
                  <p className="text-sm text-slate-500">
                    Liderança
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      supporter.is_leader
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {supporter.is_leader
                      ? "Sim"
                      : "Não"}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <History
                  size={21}
                  className="text-[#081B33]"
                />

                <h2 className="text-xl font-semibold text-[#081B33]">
                  Histórico
                </h2>
              </div>

              {activities.length === 0 ? (
                <p className="mt-6 text-sm text-slate-400">
                  Nenhuma atividade
                  registrada.
                </p>
              ) : (
                <div className="mt-6 space-y-5">
                  {activities.map(
                    (activity) => (
                      <article
                        key={activity.id}
                        className="relative pl-12"
                      >
                        <div className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          {getActivityIcon(
                            activity.activity_type
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                                {activityLabels[
                                  activity
                                    .activity_type
                                ] ??
                                  "Atividade"}
                              </span>

                              <h3 className="mt-1 font-semibold text-[#081B33]">
                                {
                                  activity.title
                                }
                              </h3>
                            </div>

                            <time className="shrink-0 text-xs text-slate-400">
                              {new Intl.DateTimeFormat(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month:
                                    "2-digit",
                                  year: "numeric",
                                }
                              ).format(
                                new Date(
                                  activity.created_at
                                )
                              )}
                            </time>
                          </div>

                          {activity.description ? (
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                              {
                                activity.description
                              }
                            </p>
                          ) : null}
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-700">
        {value || "Não informado"}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="text-right text-sm font-semibold text-[#081B33]">
        {value}
      </p>
    </div>
  );
}