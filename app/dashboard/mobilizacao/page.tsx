import {
  CheckCircle2,
  Map as MapIcon,
  MapPin,
  Target,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EditMobilizationForm } from "./edit-mobilization-form";
import { TeamMembersManager } from "./team-members-manager";
import {
  toggleCampaignAreaStatus,
  toggleMobilizationTeamStatus,
} from "./actions";
import { MobilizationForms } from "./mobilization-forms";

const areaTypeLabels: Record<string, string> = {
  city: "Cidade",
  neighborhood: "Bairro",
  region: "Região",
  district: "Distrito",
  other: "Outro",
};

export default async function MobilizationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("campaign_members")
    .select(`
      id,
      campaign_id,
      role,
      is_active
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/login");
  }

  const canManage =
    membership.role === "super_admin" ||
    membership.role === "campaign_admin" ||
    membership.role === "manager" ||
    membership.role === "editor";

 const [
  { data: areasData },
  { data: teamsData },
  { data: membersData },
  { data: teamMembersData },
  { data: supportersData },
] = await Promise.all([
    supabase
      .from("campaign_areas")
      .select(`
        id,
        name,
        area_type,
        city,
        neighborhood,
        region,
        coordinator_member_id,
        supporters_goal,
        visits_goal,
        notes,
        is_active,
        created_at
      `)
      .eq("campaign_id", membership.campaign_id)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("mobilization_teams")
      .select(`
        id,
        name,
        area_id,
        coordinator_member_id,
        description,
        supporters_goal,
        visits_goal,
        events_goal,
        is_active,
        created_at
      `)
      .eq("campaign_id", membership.campaign_id)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("campaign_members")
      .select(`
        id,
        user_id,
        job_title,
        role,
        is_active
      `)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true),

       supabase
      .from("mobilization_team_members")
      .select(`
        id,
        team_id,
        campaign_member_id,
        team_role,
        is_active
      `)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true),

      supabase
  .from("supporters")
  .select(`
    id,
    area_id,
    team_id,
    status,
    is_leader,
    next_contact_at
  `)
  .eq("campaign_id", membership.campaign_id)
  .eq("is_active", true),
  ]);

  const areas = areasData ?? [];
  const teams = teamsData ?? [];
  const campaignMembers = membersData ?? [];
  const teamMemberships = teamMembersData ?? [];
  const supporters = supportersData ?? [];

  const userIds = campaignMembers.map(
    (member) => member.user_id
  );

  const { data: profilesData } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            full_name
          `)
          .in("id", userIds)
      : { data: [] };

  const profileMap = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id,
      profile.full_name,
    ])
  );

  const memberMap = new Map(
    campaignMembers.map((member) => [
      member.id,
      {
        id: member.id,
        name:
          profileMap.get(member.user_id) ??
          "Integrante",
        jobTitle: member.job_title ?? null,
      },
    ])
  );

  const coordinators = campaignMembers.map(
    (member) => ({
      id: member.id,
      name:
        profileMap.get(member.user_id) ??
        "Integrante",
      jobTitle: member.job_title ?? null,
    })
  );

  const areaMap = new Map(
    areas.map((area) => [area.id, area.name])
  );

  const activeAreas = areas.filter(
    (area) => area.is_active
  ).length;

  const activeTeams = teams.filter(
    (team) => team.is_active
  ).length;

  const supportersGoal = teams
    .filter((team) => team.is_active)
    .reduce(
      (total, team) =>
        total + (team.supporters_goal ?? 0),
      0
    );

  const visitsGoal = teams
    .filter((team) => team.is_active)
    .reduce(
      (total, team) =>
        total + (team.visits_goal ?? 0),
      0
    );

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
              Gestão territorial
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#081B33] sm:text-4xl">
              Mobilização
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-500">
              Organize áreas estratégicas, equipes,
              coordenadores e metas de campanha.
            </p>
          </div>

          {canManage ? (
            <MobilizationForms
              coordinators={coordinators}
              areas={areas
                .filter((area) => area.is_active)
                .map((area) => ({
                  id: area.id,
                  name: area.name,
                }))}
            />
          ) : null}
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Áreas ativas
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-[#081B33]">
                {activeAreas}
              </p>

              <MapIcon
                size={22}
                className="text-blue-600"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Equipes ativas
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-[#081B33]">
                {activeTeams}
              </p>

              <UsersRound
                size={22}
                className="text-emerald-600"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Meta de apoiadores
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-[#081B33]">
                {supportersGoal}
              </p>

              <Target
                size={22}
                className="text-amber-600"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Meta de visitas
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-[#081B33]">
                {visitsGoal}
              </p>

              <MapPin
                size={22}
                className="text-purple-600"
              />
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div>
            <h2 className="text-xl font-semibold text-[#081B33]">
              Equipes de mobilização
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Equipes responsáveis pela atuação em campo.
            </p>
          </div>

          {teams.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <UsersRound
                size={36}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-[#081B33]">
                Nenhuma equipe cadastrada
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              {teams.map((team) => {
                const coordinator = team.coordinator_member_id
                  ? memberMap.get(
                      team.coordinator_member_id
                    )
                  : null;

                  const currentTeamMembers = teamMemberships
  .filter(
    (teamMember) =>
      teamMember.team_id === team.id
  )
  .map((teamMember) => {
    const member = memberMap.get(
      teamMember.campaign_member_id
    );

    return {
      id: teamMember.id,
      campaignMemberId:
        teamMember.campaign_member_id,
      name: member?.name ?? "Integrante",
      jobTitle: member?.jobTitle ?? null,
      teamRole: teamMember.team_role,
    };
  });

  const teamSupporters = supporters.filter(
  (supporter) =>
    supporter.team_id === team.id &&
    supporter.status !== "inactive"
);

const totalTeamSupporters =
  teamSupporters.length;

const totalVolunteers =
  teamSupporters.filter(
    (supporter) =>
      supporter.status === "volunteer"
  ).length;

const totalLeaders =
  teamSupporters.filter(
    (supporter) => supporter.is_leader
  ).length;

const now = new Date();

const pendingContacts =
  teamSupporters.filter((supporter) => {
    if (!supporter.next_contact_at) {
      return false;
    }

    return (
      new Date(
        supporter.next_contact_at
      ).getTime() <= now.getTime()
    );
  }).length;

const supportersGoal =
  team.supporters_goal ?? 0;

const supportersProgress =
  supportersGoal > 0
    ? Math.min(
        Math.round(
          (totalTeamSupporters /
            supportersGoal) *
            100
        ),
        100
      )
    : 0;

                return (
                  <article
                    key={team.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[#081B33]">
                            {team.name}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              team.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {team.is_active
                              ? "Ativa"
                              : "Inativa"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {team.area_id
                            ? areaMap.get(team.area_id) ??
                              "Área não encontrada"
                            : "Sem área definida"}
                        </p>
                      </div>

                      <UsersRound className="text-slate-300" />
                    </div>

                    {team.description ? (
                      <p className="mt-4 text-sm leading-6 text-slate-500">
                        {team.description}
                      </p>
                    ) : null}

                    <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                      <UserRound
                        size={18}
                        className="text-slate-400"
                      />

                      <div>
                        <p className="text-xs text-slate-400">
                          Coordenador
                        </p>

                        <p className="text-sm font-semibold text-[#081B33]">
                          {coordinator?.name ??
                            "Não definido"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Mobilização da equipe
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Desempenho atual em relação à meta.
      </p>
    </div>

    <p className="text-2xl font-semibold text-[#081B33]">
      {supportersProgress}%
    </p>
  </div>

  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
    <div
      className="h-full rounded-full bg-[#D4AF37] transition-all"
      style={{
        width: `${supportersProgress}%`,
      }}
    />
  </div>

  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
    <span>
      {totalTeamSupporters} cadastrados
    </span>

    <span>
      Meta: {supportersGoal}
    </span>
  </div>
</div>

<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
  <div className="rounded-2xl border border-slate-100 p-3 text-center">
    <p className="text-xs text-slate-400">
      Apoiadores
    </p>

    <p className="mt-1 text-lg font-semibold text-[#081B33]">
      {totalTeamSupporters}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-100 p-3 text-center">
    <p className="text-xs text-slate-400">
      Voluntários
    </p>

    <p className="mt-1 text-lg font-semibold text-[#081B33]">
      {totalVolunteers}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-100 p-3 text-center">
    <p className="text-xs text-slate-400">
      Lideranças
    </p>

    <p className="mt-1 text-lg font-semibold text-[#081B33]">
      {totalLeaders}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-100 p-3 text-center">
    <p className="text-xs text-slate-400">
      Pendentes
    </p>

    <p className="mt-1 text-lg font-semibold text-[#081B33]">
      {pendingContacts}
    </p>
  </div>
</div>

<div className="mt-4 grid grid-cols-2 gap-3">
  <div className="rounded-2xl border border-slate-100 p-3 text-center">
    <p className="text-xs text-slate-400">
      Meta de visitas
    </p>

    <p className="mt-1 font-semibold text-[#081B33]">
      {team.visits_goal ?? 0}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-100 p-3 text-center">
    <p className="text-xs text-slate-400">
      Meta de eventos
    </p>

    <p className="mt-1 font-semibold text-[#081B33]">
      {team.events_goal ?? 0}
    </p>
  </div>
</div>

<Link
  href={`/dashboard/apoiadores?equipe=${team.id}`}
  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#081B33] text-sm font-semibold text-[#081B33] transition hover:bg-[#081B33] hover:text-white"
>
  Ver apoiadores da equipe
</Link>
                    

                    <TeamMembersManager
  teamId={team.id}
  teamName={team.name}
  campaignMembers={coordinators}
  teamMembers={currentTeamMembers}
  canManage={canManage}
/>

{canManage ? (
  <div className="mt-5">
    <EditMobilizationForm
      type="team"
      item={{
        id: team.id,
        name: team.name,
        areaId: team.area_id,
        coordinatorMemberId:
          team.coordinator_member_id,
        description: team.description,
        supportersGoal:
          team.supporters_goal ?? 0,
        visitsGoal:
          team.visits_goal ?? 0,
        eventsGoal:
          team.events_goal ?? 0,
      }}
      coordinators={coordinators}
      areas={areas.map((area) => ({
        id: area.id,
        name: area.name,
      }))}
    />
  </div>
) : null}

                    {canManage ? (
                      <form
                        action={
                          toggleMobilizationTeamStatus
                        }
                        className="mt-5"
                      >
                        <input
                          type="hidden"
                          name="team_id"
                          value={team.id}
                        />

                        <input
                          type="hidden"
                          name="next_status"
                          value={String(
                            !team.is_active
                          )}
                        />

                        <button
                          type="submit"
                          className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
                            team.is_active
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {team.is_active ? (
                            <>
                              <XCircle size={16} />
                              Desativar equipe
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              Ativar equipe
                            </>
                          )}
                        </button>
                      </form>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-xl font-semibold text-[#081B33]">
              Áreas de atuação
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Divisão territorial da mobilização.
            </p>
          </div>

          {areas.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <MapPinnedEmpty />
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {areas.map((area) => {
                const coordinator =
                  area.coordinator_member_id
                    ? memberMap.get(
                        area.coordinator_member_id
                      )
                    : null;

                return (
                  <article
                    key={area.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {areaTypeLabels[
                            area.area_type
                          ] ?? area.area_type}
                        </span>

                        <h3 className="mt-3 text-lg font-semibold text-[#081B33]">
                          {area.name}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          area.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {area.is_active
                          ? "Ativa"
                          : "Inativa"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                      {area.city ? (
                        <p>Cidade: {area.city}</p>
                      ) : null}

                      {area.neighborhood ? (
                        <p>
                          Bairro: {area.neighborhood}
                        </p>
                      ) : null}

                      {area.region ? (
                        <p>Região: {area.region}</p>
                      ) : null}
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Coordenador
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#081B33]">
                        {coordinator?.name ??
                          "Não definido"}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 p-3">
                        <p className="text-xs text-slate-400">
                          Apoiadores
                        </p>
                        <p className="mt-1 font-semibold text-[#081B33]">
                          {area.supporters_goal}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 p-3">
                        <p className="text-xs text-slate-400">
                          Visitas
                        </p>
                        <p className="mt-1 font-semibold text-[#081B33]">
                          {area.visits_goal}
                        </p>
                      </div>
                    </div>

                    {canManage ? (
  <div className="mt-4">
    <EditMobilizationForm
      type="area"
      item={{
        id: area.id,
        name: area.name,
        areaType: area.area_type,
        city: area.city,
        neighborhood: area.neighborhood,
        region: area.region,
        coordinatorMemberId:
          area.coordinator_member_id,
        supportersGoal:
          area.supporters_goal ?? 0,
        visitsGoal:
          area.visits_goal ?? 0,
        notes: area.notes,
      }}
      coordinators={coordinators}
    />
  </div>
) : null}

                    {canManage ? (
                      <form
                        action={toggleCampaignAreaStatus}
                        className="mt-4"
                      >
                        <input
                          type="hidden"
                          name="area_id"
                          value={area.id}
                        />

                        <input
                          type="hidden"
                          name="next_status"
                          value={String(
                            !area.is_active
                          )}
                        />

                        <button
                          type="submit"
                          className={`h-10 w-full rounded-xl text-sm font-semibold ${
                            area.is_active
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {area.is_active
                            ? "Desativar área"
                            : "Ativar área"}
                        </button>
                      </form>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MapPinnedEmpty() {
  return (
    <>
      <MapIcon
        size={36}
        className="mx-auto text-slate-300"
      />

      <p className="mt-4 font-semibold text-[#081B33]">
        Nenhuma área cadastrada
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Cadastre a primeira área territorial da
        campanha.
      </p>
    </>
  );
}