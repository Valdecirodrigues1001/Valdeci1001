import {
  MapPin,
  MessageCircle,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupporterForm } from "./supporter-form";

type Supporter = {
  id: string;
  full_name: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  neighborhood: string | null;
  profession: string | null;
  status:
    | "lead"
    | "supporter"
    | "volunteer"
    | "inactive";
  origin:
    | "landing_page"
    | "manual"
    | "event"
    | "referral"
    | "social_media"
    | "other";
  created_at: string;
};

type AreaOption = {
  id: string;
  name: string;
};

type TeamOption = {
  id: string;
  name: string;
  areaId: string | null;
};

type MemberOption = {
  id: string;
  name: string;
  jobTitle: string | null;
};

type SupportersPageProps = {
  searchParams: Promise<{
    busca?: string;
    equipe?: string;
    area?: string;
  }>;
};

const statusLabels: Record<
  Supporter["status"],
  string
> = {
  lead: "Contato inicial",
  supporter: "Apoiador",
  volunteer: "Voluntário",
  inactive: "Inativo",
};

const originLabels: Record<
  Supporter["origin"],
  string
> = {
  landing_page: "Landing Page",
  manual: "Cadastro manual",
  event: "Evento",
  referral: "Indicação",
  social_media: "Rede social",
  other: "Outro",
};

export default async function SupportersPage({
  searchParams,
}: SupportersPageProps) {
  const {
  busca = "",
  equipe = "",
  area = "",
} = await searchParams;

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
    { data: areasData, error: areasError },
    { data: teamsData, error: teamsError },
    { data: membersData, error: membersError },
  ] = await Promise.all([
    supabase
      .from("campaign_areas")
      .select(`
        id,
        name
      `)
      .eq(
        "campaign_id",
        membership.campaign_id
      )
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("mobilization_teams")
      .select(`
        id,
        name,
        area_id
      `)
      .eq(
        "campaign_id",
        membership.campaign_id
      )
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("campaign_members")
      .select(`
        id,
        user_id,
        job_title
      `)
      .eq(
        "campaign_id",
        membership.campaign_id
      )
      .eq("is_active", true),
  ]);

  if (areasError) {
    console.error(
      "Erro ao buscar áreas:",
      areasError
    );
  }

  if (teamsError) {
    console.error(
      "Erro ao buscar equipes:",
      teamsError
    );
  }

  if (membersError) {
    console.error(
      "Erro ao buscar integrantes:",
      membersError
    );
  }

  const campaignMembers = membersData ?? [];

  const userIds = campaignMembers.map(
    (member) => member.user_id
  );

  const { data: profilesData, error: profilesError } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            full_name
          `)
          .in("id", userIds)
      : {
          data: [],
          error: null,
        };

  if (profilesError) {
    console.error(
      "Erro ao buscar perfis:",
      profilesError
    );
  }

  const profileMap = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id,
      profile.full_name,
    ])
  );

  const areas: AreaOption[] = (
    areasData ?? []
  ).map((area) => ({
    id: area.id,
    name: area.name,
  }));

  const teams: TeamOption[] = (
    teamsData ?? []
  ).map((team) => ({
    id: team.id,
    name: team.name,
    areaId: team.area_id,
  }));

  const memberOptions: MemberOption[] =
    campaignMembers.map((member) => ({
      id: member.id,
      name:
        profileMap.get(member.user_id) ??
        "Integrante",
      jobTitle: member.job_title ?? null,
    }));
    const selectedTeam = equipe
  ? teams.find((team) => team.id === equipe)
  : null;

const selectedArea = area
  ? areas.find((item) => item.id === area)
  : null;

  let supportersQuery = supabase
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
    origin,
    created_at
  `)
  .eq(
    "campaign_id",
    membership.campaign_id
  )
  .eq("is_active", true)
  .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });

  const normalizedSearch = busca.trim();

  if (normalizedSearch) {
    const safeSearch = normalizedSearch
      .replaceAll(",", " ")
      .replaceAll("%", "");

    supportersQuery = supportersQuery.or(
      [
        `full_name.ilike.%${safeSearch}%`,
        `whatsapp.ilike.%${safeSearch}%`,
        `phone.ilike.%${safeSearch}%`,
        `city.ilike.%${safeSearch}%`,
        `neighborhood.ilike.%${safeSearch}%`,
      ].join(",")
    );
  }

  if (equipe) {
  supportersQuery = supportersQuery.eq(
    "team_id",
    equipe
  );
}

if (area) {
  supportersQuery = supportersQuery.eq(
    "area_id",
    area
  );
}
  const {
    data: supportersData,
    error: supportersError,
  } = await supportersQuery;

  if (supportersError) {
    console.error(
      "Erro ao buscar apoiadores:",
      supportersError
    );
  }

  const supporters =
    (supportersData ?? []) as Supporter[];

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
              Base política
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#081B33] sm:text-4xl">
              Apoiadores
            </h1>

            <p className="mt-2 text-slate-500">
              Organize os contatos e
              relacionamentos da campanha.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#081B33] text-white">
              <Users size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total cadastrado
              </p>

              <p className="mt-1 text-xl font-semibold text-[#081B33]">
                {supporters.length}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#081B33]/5 text-[#081B33]">
              <UserPlus size={21} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#081B33]">
                Novo apoiador
              </h2>

              <p className="text-sm text-slate-500">
                Cadastre uma nova pessoa na base da
                campanha.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <SupporterForm
              areas={areas}
              teams={teams}
              members={memberOptions}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#081B33]">
                Pessoas cadastradas
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulte e acompanhe a base da
                campanha.
              </p>
            </div>

            <form
  method="get"
  className="relative w-full sm:max-w-md"
>
  {equipe ? (
    <input
      type="hidden"
      name="equipe"
      value={equipe}
    />
  ) : null}

  {area ? (
    <input
      type="hidden"
      name="area"
      value={area}
    />
  ) : null}

  <Search
    size={19}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  />

  <input
    type="search"
    name="busca"
    defaultValue={busca}
    placeholder="Buscar nome, telefone, cidade..."
    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
  />
</form>
          </div>
{selectedTeam || selectedArea ? (
  <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
    <span className="text-sm font-medium text-slate-500">
      Filtro ativo:
    </span>

    {selectedTeam ? (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
        Equipe: {selectedTeam.name}
      </span>
    ) : null}

    {selectedArea ? (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
        Área: {selectedArea.name}
      </span>
    ) : null}

    <Link
      href="/dashboard/apoiadores"
      className="ml-auto text-sm font-semibold text-red-600 transition hover:text-red-700"
    >
      Limpar filtro
    </Link>
  </div>
) : null}

          {supporters.length === 0 ? (
            <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-700">
                Nenhum apoiador encontrado
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Cadastre o primeiro apoiador ou
                altere os termos da busca.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {supporters.map((supporter) => {
                const contact =
                  supporter.whatsapp ||
                  supporter.phone ||
                  supporter.email;

                return (
                  <Link
                    key={supporter.id}
                    href={`/dashboard/apoiadores/${supporter.id}`}
                    className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#081B33] font-semibold text-white">
                          {supporter.full_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-[#081B33]">
                            {supporter.full_name}
                          </h3>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {supporter.profession ||
                              "Profissão não informada"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {
                          statusLabels[
                            supporter.status
                          ]
                        }
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle
                          size={17}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="truncate">
                          {contact ||
                            "Contato não informado"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin
                          size={17}
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
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-xs text-slate-400">
                        Origem:{" "}
                        {
                          originLabels[
                            supporter.origin
                          ]
                        }
                      </p>

                      <p className="text-xs text-slate-400">
                        {new Intl.DateTimeFormat(
                          "pt-BR"
                        ).format(
                          new Date(
                            supporter.created_at
                          )
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}