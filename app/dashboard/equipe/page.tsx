import {
  CheckCircle2,
  Crown,
  Eye,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  UserCog,
  UserRoundCog,
  Users,
  XCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteMemberForm } from "./invite-member-form";
import {
  toggleTeamMemberStatus,
  updateTeamMember,
} from "./actions";

type TeamPageProps = {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
  }>;
};

const roleLabels: Record<string, string> = {
  super_admin: "Superadministrador",
  campaign_admin: "Administrador",
  manager: "Gestor",
  editor: "Editor",
  viewer: "Visualizador",
};

const roleClasses: Record<string, string> = {
  super_admin:
    "bg-purple-50 text-purple-700",
  campaign_admin:
    "bg-blue-50 text-blue-700",
  manager:
    "bg-amber-50 text-amber-700",
  editor:
    "bg-emerald-50 text-emerald-700",
  viewer:
    "bg-slate-100 text-slate-600",
};

const roleIcons = {
  super_admin: Crown,
  campaign_admin: ShieldCheck,
  manager: UserCog,
  editor: Pencil,
  viewer: Eye,
};

export default async function TeamPage({
  searchParams,
}: TeamPageProps) {
  const filters = await searchParams;

  const search = filters.search?.trim() ?? "";
  const selectedRole = filters.role ?? "all";
  const selectedStatus = filters.status ?? "active";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentMembership } =
    await supabase
      .from("campaign_members")
      .select(`
        id,
        campaign_id,
        role,
        is_active
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

  if (!currentMembership) {
    redirect("/login");
  }

  const canManage =
    currentMembership.role === "super_admin" ||
    currentMembership.role === "campaign_admin";

  let membersQuery = supabase
    .from("campaign_members")
    .select(`
      id,
      user_id,
      role,
      job_title,
      phone,
      is_active,
      joined_at,
      created_at
    `)
    .eq(
      "campaign_id",
      currentMembership.campaign_id
    )
    .order("created_at", {
      ascending: true,
    });

  if (selectedRole !== "all") {
    membersQuery = membersQuery.eq(
      "role",
      selectedRole
    );
  }

  if (selectedStatus === "inactive") {
    membersQuery = membersQuery.eq(
      "is_active",
      false
    );
  } else if (selectedStatus === "all") {
    // Exibe todos.
  } else {
    membersQuery = membersQuery.eq(
      "is_active",
      true
    );
  }

  const { data: membersData, error } =
    await membersQuery;

  if (error) {
    console.error(
      "Erro ao carregar equipe:",
      error
    );
  }

  const members = membersData ?? [];

  const userIds = members.map(
    (member) => member.user_id
  );

  const { data: profilesData } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            avatar_url
          `)
          .in("id", userIds)
      : {
          data: [],
        };

  const profilesMap = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  const teamMembers = members
    .map((member) => {
      const profile = profilesMap.get(
        member.user_id
      );

      return {
        ...member,
        full_name:
          profile?.full_name ??
          "Integrante sem nome",
        avatar_url:
          profile?.avatar_url ?? null,
      };
    })
    .filter((member) => {
      if (!search) {
        return true;
      }

      const normalizedSearch =
        search.toLocaleLowerCase("pt-BR");

      return (
        member.full_name
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch) ||
        member.job_title
          ?.toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch) ||
        member.phone
          ?.toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch)
      );
    });

  const activeCount = members.filter(
    (member) => member.is_active
  ).length;

  const adminCount = members.filter(
    (member) =>
      member.is_active &&
      (member.role === "super_admin" ||
        member.role === "campaign_admin")
  ).length;

  const managerCount = members.filter(
    (member) =>
      member.is_active &&
      member.role === "manager"
  ).length;

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
              Gestão de acessos
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#081B33] sm:text-4xl">
              Equipe da campanha
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-500">
              Organize os integrantes, funções e
              permissões de acesso ao sistema.
            </p>
          </div>

          {canManage ? <InviteMemberForm /> : null}
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total da equipe
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-[#081B33]">
                {members.length}
              </p>

              <Users
                size={22}
                className="text-slate-400"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Integrantes ativos
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-[#081B33]">
                {activeCount}
              </p>

              <CheckCircle2
                size={22}
                className="text-emerald-600"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Administradores
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-[#081B33]">
                {adminCount}
              </p>

              <ShieldCheck
                size={22}
                className="text-blue-600"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Gestores
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-[#081B33]">
                {managerCount}
              </p>

              <UserCog
                size={22}
                className="text-amber-600"
              />
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="grid gap-4 md:grid-cols-[1fr_220px_220px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Buscar por nome, função ou telefone"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
              />
            </div>

            <select
              name="role"
              defaultValue={selectedRole}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#081B33]"
            >
              <option value="all">
                Todos os acessos
              </option>

              <option value="campaign_admin">
                Administradores
              </option>

              <option value="manager">
                Gestores
              </option>

              <option value="editor">
                Editores
              </option>

              <option value="viewer">
                Visualizadores
              </option>
            </select>

            <select
              name="status"
              defaultValue={selectedStatus}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#081B33]"
            >
              <option value="active">
                Ativos
              </option>

              <option value="inactive">
                Inativos
              </option>

              <option value="all">
                Todos os status
              </option>
            </select>

            <button
              type="submit"
              className="h-12 rounded-xl bg-[#081B33] px-6 text-sm font-semibold text-white transition hover:bg-[#102A4C]"
            >
              Filtrar
            </button>
          </form>
        </section>

        {teamMembers.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Users
              size={38}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#081B33]">
              Nenhum integrante encontrado
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Altere os filtros ou adicione um novo
              integrante à campanha.
            </p>
          </section>
        ) : (
          <section className="mt-6 space-y-4">
            {teamMembers.map((member) => {
              const RoleIcon =
                roleIcons[
                  member.role as keyof typeof roleIcons
                ] ?? UserRoundCog;

              const isCurrentUser =
                member.user_id === user.id;

              const isSuperAdmin =
                member.role === "super_admin";

              return (
                <article
                  key={member.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#081B33] text-lg font-semibold text-white">
                          {member.full_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-lg font-semibold text-[#081B33]">
                            {member.full_name}
                          </h2>

                          {isCurrentUser ? (
                            <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-1 text-xs font-semibold text-[#8A6A00]">
                              Você
                            </span>
                          ) : null}

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              roleClasses[
                                member.role
                              ] ??
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <RoleIcon size={13} />

                            {roleLabels[
                              member.role
                            ] ?? member.role}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              member.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {member.is_active
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {member.job_title ||
                            "Função não informada"}
                        </p>

                        {member.phone ? (
                          <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                            <Phone size={15} />
                            {member.phone}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {canManage && !isSuperAdmin ? (
                      <div className="grid gap-3 lg:grid-cols-[1fr_auto] xl:w-[650px]">
                        <form
                          action={updateTeamMember}
                          className="grid gap-3 sm:grid-cols-3"
                        >
                          <input
                            type="hidden"
                            name="member_id"
                            value={member.id}
                          />

                          <input
                            type="text"
                            name="job_title"
                            defaultValue={
                              member.job_title ?? ""
                            }
                            placeholder="Função na campanha"
                            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#081B33]"
                          />

                          <input
                            type="tel"
                            name="phone"
                            defaultValue={
                              member.phone ?? ""
                            }
                            placeholder="Telefone"
                            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#081B33]"
                          />

                          <select
                            name="role"
                            defaultValue={member.role}
                            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#081B33]"
                          >
                            <option value="campaign_admin">
                              Administrador
                            </option>

                            <option value="manager">
                              Gestor
                            </option>

                            <option value="editor">
                              Editor
                            </option>

                            <option value="viewer">
                              Visualizador
                            </option>
                          </select>

                          <button
                            type="submit"
                            className="h-11 rounded-xl bg-[#081B33] px-4 text-sm font-semibold text-white transition hover:bg-[#102A4C] sm:col-span-3"
                          >
                            Salvar alterações
                          </button>
                        </form>

                        <form
                          action={
                            toggleTeamMemberStatus
                          }
                        >
                          <input
                            type="hidden"
                            name="member_id"
                            value={member.id}
                          />

                          <input
                            type="hidden"
                            name="next_status"
                            value={String(
                              !member.is_active
                            )}
                          />

                          <button
                            type="submit"
                            disabled={
                              isCurrentUser &&
                              member.is_active
                            }
                            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition lg:w-auto ${
                              member.is_active
                                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            {member.is_active ? (
                              <>
                                <XCircle size={17} />
                                Desativar
                              </>
                            ) : (
                              <>
                                <CheckCircle2
                                  size={17}
                                />
                                Ativar
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}