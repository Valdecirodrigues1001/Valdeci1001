import {
  Handshake,
  MapPin,
  MessageCircle,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeaderForm } from "./leader-form";


type Leader = {
  id: string;
  full_name: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  profession: string | null;
  city: string | null;
  neighborhood: string | null;
  area_of_influence: string | null;
  estimated_supporters: number;
  status: "prospect" | "active" | "inactive";
  created_at: string;
  parent_leader_id: string | null;
};

type SupporterRelation = {
  leader_id: string | null;
};

type LeadersPageProps = {
  searchParams: Promise<{
    busca?: string;
  }>;
};

const statusLabels: Record<Leader["status"], string> = {
  prospect: "Em prospecção",
  active: "Ativa",
  inactive: "Inativa",
};

const statusClasses: Record<Leader["status"], string> = {
  prospect: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
};

export default async function LeadersPage({
  searchParams,
}: LeadersPageProps) {
  const { busca = "" } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  let leaders: Leader[] = [];
  let supporterRelations: SupporterRelation[] = [];

  if (membership) {
    let leadersQuery = supabase
      .from("leaders")
      .select(`
        id,
        full_name,
        whatsapp,
        phone,
        email,
        profession,
        city,
        neighborhood,
        area_of_influence,
        estimated_supporters,
        status,
        created_at,
        parent_leader_id
      `)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (busca.trim()) {
      const normalizedSearch = busca
        .trim()
        .replaceAll(",", " ");

      leadersQuery = leadersQuery.or(
        `full_name.ilike.%${normalizedSearch}%,whatsapp.ilike.%${normalizedSearch}%,phone.ilike.%${normalizedSearch}%,city.ilike.%${normalizedSearch}%,neighborhood.ilike.%${normalizedSearch}%,area_of_influence.ilike.%${normalizedSearch}%`
      );
    }

    const { data: leadersData, error: leadersError } =
      await leadersQuery;

    if (leadersError) {
      console.error(
        "Erro ao buscar lideranças:",
        leadersError
      );
    }

    leaders = (leadersData ?? []) as Leader[];

    const { data: supportersData, error: supportersError } =
      await supabase
        .from("supporters")
        .select("leader_id")
        .eq("campaign_id", membership.campaign_id)
        .eq("is_active", true)
        .not("leader_id", "is", null);

    if (supportersError) {
      console.error(
        "Erro ao contar apoiadores das lideranças:",
        supportersError
      );
    }

    supporterRelations =
      (supportersData ?? []) as SupporterRelation[];
  }

  const supporterCountByLeader = supporterRelations.reduce<
    Record<string, number>
  >((accumulator, supporter) => {
    if (!supporter.leader_id) {
      return accumulator;
    }

    accumulator[supporter.leader_id] =
      (accumulator[supporter.leader_id] ?? 0) + 1;

    return accumulator;
  }, {});

  const activeLeaders = leaders.filter(
    (leader) => leader.status === "active"
  ).length;

  const linkedSupporters = supporterRelations.length;

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
              Rede de mobilização
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#081B33] sm:text-4xl">
              Lideranças
            </h1>

            <p className="mt-2 text-slate-500">
              Organize as pessoas responsáveis pela mobilização
              da campanha.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#081B33] text-white">
                <Handshake size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cadastradas
                </p>

                <p className="mt-1 text-xl font-semibold text-[#081B33]">
                  {leaders.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <UserPlus size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ativas
                </p>

                <p className="mt-1 text-xl font-semibold text-[#081B33]">
                  {activeLeaders}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#9A7613]">
                <Users size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Apoiadores
                </p>

                <p className="mt-1 text-xl font-semibold text-[#081B33]">
                  {linkedSupporters}
                </p>
              </div>
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
                Nova liderança
              </h2>

              <p className="text-sm text-slate-500">
                Cadastre uma pessoa responsável pela mobilização.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <LeaderForm
              parentLeaders={leaders.map((leader) => ({
                id: leader.id,
                full_name: leader.full_name,
              }))}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#081B33]">
                Rede de lideranças
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulte as lideranças e seus apoiadores.
              </p>
            </div>

            <form className="relative w-full sm:max-w-md">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                name="busca"
                defaultValue={busca}
                placeholder="Buscar nome, bairro, cidade..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
              />
            </form>
          </div>

          {leaders.length === 0 ? (
            <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Handshake size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-700">
                Nenhuma liderança encontrada
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Cadastre a primeira liderança ou altere os termos
                da busca.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {leaders.map((leader) => {
                const contact =
                  leader.whatsapp ||
                  leader.phone ||
                  leader.email;

                const linkedCount =
                  supporterCountByLeader[leader.id] ?? 0;

                const parentLeader = leaders.find(
                  (item) => item.id === leader.parent_leader_id
                );

                return (
                  <Link
                    key={leader.id}
                    href={`/dashboard/liderancas/${leader.id}`}
                    className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#081B33] font-semibold text-white">
                          {leader.full_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-[#081B33]">
                            {leader.full_name}
                          </h3>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {leader.area_of_influence ||
                              leader.profession ||
                              "Área de influência não informada"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClasses[leader.status]
                        }`}
                      >
                        {statusLabels[leader.status]}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle
                          size={17}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="truncate">
                          {contact || "Contato não informado"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin
                          size={17}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="truncate">
                          {[leader.neighborhood, leader.city]
                            .filter(Boolean)
                            .join(", ") ||
                            "Localização não informada"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-400">
                          Apoiadores vinculados
                        </p>

                        <p className="mt-1 font-semibold text-[#081B33]">
                          {linkedCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Potencial estimado
                        </p>

                        <p className="mt-1 font-semibold text-[#081B33]">
                          {leader.estimated_supporters}
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-slate-400">
                          Responsável
                        </p>

                        <p className="mt-1 truncate font-semibold text-[#081B33]">
                          {parentLeader?.full_name || "Direta"}
                        </p>
                      </div>
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