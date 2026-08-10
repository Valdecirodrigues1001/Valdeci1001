import {
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Crown,
  Handshake,
  KanbanSquare,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CrmStageSelect } from "./crm-stage-select";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CrmStage =
  | "new"
  | "contact"
  | "negotiation"
  | "confirmed"
  | "volunteer"
  | "leader";

type SupporterStatus =
  | "lead"
  | "supporter"
  | "volunteer"
  | "inactive";

type SupporterRow = {
  id: string;
  full_name: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  neighborhood: string | null;
  profession: string | null;
  status: SupporterStatus;
  crm_stage: CrmStage | null;
  next_contact_at: string | null;
  is_leader: boolean;
  team_id: string | null;
  assigned_member_id: string | null;
  created_at: string;
};

type TeamRow = {
  id: string;
  name: string;
};

type MemberRow = {
  id: string;
  user_id: string;
  job_title: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type CrmPageProps = {
  searchParams: Promise<{
    busca?: string;
  }>;
};

type StageConfig = {
  id: CrmStage;
  label: string;
  description: string;
  icon: typeof Users;
};

const crmStages: StageConfig[] = [
  {
    id: "new",
    label: "Novo contato",
    description: "Cadastros que ainda não foram trabalhados.",
    icon: Sparkles,
  },
  {
    id: "contact",
    label: "Primeiro contato",
    description: "Pessoas que já receberam a primeira abordagem.",
    icon: MessageCircle,
  },
  {
    id: "negotiation",
    label: "Em acompanhamento",
    description: "Contatos em processo de relacionamento.",
    icon: Handshake,
  },
  {
    id: "confirmed",
    label: "Apoio confirmado",
    description: "Pessoas que confirmaram apoio à campanha.",
    icon: CheckCircle2,
  },
  {
    id: "volunteer",
    label: "Voluntários",
    description: "Apoiadores disponíveis para ajudar na campanha.",
    icon: UserRoundCheck,
  },
  {
    id: "leader",
    label: "Lideranças",
    description: "Pessoas com influência e capacidade de mobilização.",
    icon: Crown,
  },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function isContactOverdue(value: string | null) {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() < Date.now();
}

export default async function CrmPage({
  searchParams,
}: CrmPageProps) {
  const { busca = "" } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    redirect("/login");
  }

  const [
    { data: supportersData, error: supportersError },
    { data: teamsData, error: teamsError },
    { data: membersData, error: membersError },
  ] = await Promise.all([
    supabase
      .from("supporters")
      .select(`
        id,
        full_name,
        whatsapp,
        phone,
        email,
        city,
        neighborhood,
        profession,
        status,
        crm_stage,
        next_contact_at,
        is_leader,
        team_id,
        assigned_member_id,
        created_at
      `)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("mobilization_teams")
      .select(`
        id,
        name
      `)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("campaign_members")
      .select(`
        id,
        user_id,
        job_title
      `)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true),
  ]);

  if (supportersError) {
    console.error(
      "Erro ao buscar apoiadores do CRM:",
      supportersError
    );
  }

  if (teamsError) {
    console.error(
      "Erro ao buscar equipes do CRM:",
      teamsError
    );
  }

  if (membersError) {
    console.error(
      "Erro ao buscar integrantes do CRM:",
      membersError
    );
  }

  const supporters =
    (supportersData ?? []) as SupporterRow[];

  const teams = (teamsData ?? []) as TeamRow[];
  const members = (membersData ?? []) as MemberRow[];

  const profileIds = members
    .map((member) => member.user_id)
    .filter(Boolean);

  const {
    data: profilesData,
    error: profilesError,
  } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            full_name
          `)
          .in("id", profileIds)
      : {
          data: [],
          error: null,
        };

  if (profilesError) {
    console.error(
      "Erro ao buscar perfis do CRM:",
      profilesError
    );
  }

  const profiles =
    (profilesData ?? []) as ProfileRow[];

  const teamMap = new Map(
    teams.map((team) => [team.id, team.name])
  );

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile.full_name ?? "Integrante",
    ])
  );

  const memberMap = new Map(
    members.map((member) => [
      member.id,
      {
        name:
          profileMap.get(member.user_id) ??
          "Integrante",
        jobTitle: member.job_title,
      },
    ])
  );

  const normalizedSearch = busca
    .trim()
    .toLocaleLowerCase("pt-BR");

  const filteredSupporters = normalizedSearch
    ? supporters.filter((supporter) => {
        const searchableValues = [
          supporter.full_name,
          supporter.whatsapp,
          supporter.phone,
          supporter.email,
          supporter.city,
          supporter.neighborhood,
          supporter.profession,
          supporter.team_id
            ? teamMap.get(supporter.team_id)
            : null,
          supporter.assigned_member_id
            ? memberMap.get(
                supporter.assigned_member_id
              )?.name
            : null,
        ];

        return searchableValues.some((value) =>
          value
            ?.toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch)
        );
      })
    : supporters;

  const supportersByStage = new Map<
    CrmStage,
    SupporterRow[]
  >(
    crmStages.map((stage) => [
      stage.id,
      filteredSupporters.filter(
        (supporter) =>
          (supporter.crm_stage ?? "new") ===
          stage.id
      ),
    ])
  );

  const totalSupporters = supporters.length;

  const confirmedSupporters = supporters.filter(
    (supporter) =>
      supporter.crm_stage === "confirmed" ||
      supporter.crm_stage === "volunteer" ||
      supporter.crm_stage === "leader"
  ).length;

  const volunteers = supporters.filter(
    (supporter) =>
      supporter.crm_stage === "volunteer" ||
      supporter.status === "volunteer"
  ).length;

  const leaders = supporters.filter(
    (supporter) =>
      supporter.crm_stage === "leader" ||
      supporter.is_leader
  ).length;

  const overdueContacts = supporters.filter(
    (supporter) =>
      isContactOverdue(
        supporter.next_contact_at
      )
  ).length;

  const conversionRate =
    totalSupporters > 0
      ? Math.round(
          (confirmedSupporters /
            totalSupporters) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1800px]">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
              <KanbanSquare size={18} />
              CRM político
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#081B33] sm:text-4xl">
              Gestão de relacionamento
            </h1>

            <p className="mt-3 max-w-3xl text-slate-500">
              Acompanhe cada contato desde o
              primeiro cadastro até a confirmação
              do apoio, voluntariado ou liderança.
            </p>
          </div>

          <Link
            href="/dashboard/apoiadores"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#081B33] px-6 text-sm font-semibold text-white transition hover:bg-[#102A4C]"
          >
            Ver todos os apoiadores
          </Link>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Base total
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#081B33]">
                <Users size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-[#081B33]">
              {totalSupporters}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Contatos ativos no CRM
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Confirmados
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-[#081B33]">
              {confirmedSupporters}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {conversionRate}% da base total
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Voluntários
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <UserRoundCheck size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-[#081B33]">
              {volunteers}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Pessoas disponíveis para ajudar
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Lideranças
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Crown size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-[#081B33]">
              {leaders}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Pessoas com poder de mobilização
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Contatos vencidos
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <CalendarClock size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-[#081B33]">
              {overdueContacts}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Pendências que exigem atenção
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#081B33]">
                Funil de relacionamento
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Visualize a situação atual de cada
                pessoa da base.
              </p>
            </div>

            <form
              method="get"
              className="relative w-full lg:max-w-md"
            >
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                name="busca"
                defaultValue={busca}
                placeholder="Buscar contato, cidade, equipe..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
              />
            </form>
          </div>

          {normalizedSearch ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <span className="text-sm text-slate-500">
                Busca ativa:
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-[#081B33]">
                {busca}
              </span>

              <Link
                href="/dashboard/crm"
                className="ml-auto text-sm font-semibold text-red-600 transition hover:text-red-700"
              >
                Limpar
              </Link>
            </div>
          ) : null}

          <div className="mt-6 overflow-x-auto pb-5">
            <div className="grid min-w-[1860px] grid-cols-6 gap-4">
              {crmStages.map((stage) => {
                const StageIcon = stage.icon;

                const stageSupporters =
                  supportersByStage.get(stage.id) ??
                  [];

                return (
                  <div
                    key={stage.id}
                    className="flex min-h-[650px] flex-col rounded-3xl border border-slate-200 bg-slate-100/70"
                  >
                    <div className="border-b border-slate-200 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#081B33] shadow-sm">
                            <StageIcon size={19} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-[#081B33]">
                              {stage.label}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {stage.description}
                            </p>
                          </div>
                        </div>

                        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-[#081B33] shadow-sm">
                          {stageSupporters.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 p-3">
                      {stageSupporters.length ===
                      0 ? (
                        <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-center">
                          <CircleDot
                            size={22}
                            className="text-slate-300"
                          />

                          <p className="mt-3 text-sm font-medium text-slate-500">
                            Nenhum contato
                          </p>
                        </div>
                      ) : (
                        stageSupporters.map(
                          (supporter) => {
                            const contact =
                              supporter.whatsapp ||
                              supporter.phone ||
                              supporter.email;

                            const teamName =
                              supporter.team_id
                                ? teamMap.get(
                                    supporter.team_id
                                  )
                                : null;

                            const responsible =
                              supporter.assigned_member_id
                                ? memberMap.get(
                                    supporter.assigned_member_id
                                  )
                                : null;

                            const contactOverdue =
                              isContactOverdue(
                                supporter.next_contact_at
                              );

                            return (
                              <Link
                                key={supporter.id}
                                href={`/dashboard/apoiadores/${supporter.id}`}
                                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#081B33] text-sm font-bold text-white">
                                    {supporter.full_name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="truncate text-sm font-semibold text-[#081B33]">
                                      {
                                        supporter.full_name
                                      }
                                    </h4>

                                    <p className="mt-1 truncate text-xs text-slate-500">
                                      {supporter.profession ||
                                        "Profissão não informada"}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    {supporter.whatsapp ? (
                                      <MessageCircle
                                        size={15}
                                        className="shrink-0 text-slate-400"
                                      />
                                    ) : (
                                      <Phone
                                        size={15}
                                        className="shrink-0 text-slate-400"
                                      />
                                    )}

                                    <span className="truncate">
                                      {contact ||
                                        "Contato não informado"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <MapPin
                                      size={15}
                                      className="shrink-0 text-slate-400"
                                    />

                                    <span className="truncate">
                                      {[
                                        supporter.neighborhood,
                                        supporter.city,
                                      ]
                                        .filter(Boolean)
                                        .join(", ") ||
                                        "Localização não informada"}
                                    </span>
                                  </div>

                                  {teamName ? (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <Users
                                        size={15}
                                        className="shrink-0 text-slate-400"
                                      />

                                      <span className="truncate">
                                        {teamName}
                                      </span>
                                    </div>
                                  ) : null}

                                  {responsible ? (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <UserRoundCheck
                                        size={15}
                                        className="shrink-0 text-slate-400"
                                      />

                                      <span className="truncate">
                                        {
                                          responsible.name
                                        }
                                      </span>
                                    </div>
                                  ) : null}
                                </div>

                                {supporter.next_contact_at ? (
                                  <div
                                    className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                                      contactOverdue
                                        ? "bg-red-50 text-red-700"
                                        : "bg-blue-50 text-blue-700"
                                    }`}
                                  >
                                    <CalendarClock
                                      size={15}
                                    />

                                    <span>
                                      {contactOverdue
                                        ? "Contato vencido"
                                        : "Próximo contato"}
                                      :{" "}
                                      {formatDateTime(
                                        supporter.next_contact_at
                                      )}
                                    </span>
                                  </div>
                                ) : null}
                                <div className="mt-4">
  <CrmStageSelect
    supporterId={supporter.id}
    currentStage={supporter.crm_stage ?? "new"}
  />
</div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                  <span className="text-[11px] text-slate-400">
                                    Cadastrado em{" "}
                                    {new Intl.DateTimeFormat(
                                      "pt-BR"
                                    ).format(
                                      new Date(
                                        supporter.created_at
                                      )
                                    )}
                                  </span>

                                  {supporter.is_leader ? (
                                    <Crown
                                      size={15}
                                      className="text-[#D4AF37]"
                                    />
                                  ) : null}
                                </div>
                              </Link>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}