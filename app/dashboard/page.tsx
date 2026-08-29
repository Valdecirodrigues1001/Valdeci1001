import {
  CalendarDays,
  Handshake,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { QuickActions } from "./quick-actions";
import { AgendaDashboard } from "./agenda-dashboard";

import {
  RecentActivities,
  type RecentActivity,
} from "./recent-activities";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profile },
    { data: membership },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("campaign_members")
      .select("campaign_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!membership) {
    redirect("/login");
  }

  const campaignId =
    membership.campaign_id;

  const firstName =
    profile?.full_name?.split(" ")[0] ??
    "Usuário";

  const now = new Date();

  const today =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(now);

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );

  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  const sevenDaysAgo =
    new Date(now);

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  );

  const twentyFourHoursAgo =
    new Date(now);

  twentyFourHoursAgo.setHours(
    twentyFourHoursAgo.getHours() - 24
  );

  const todayDateValue = [
    now.getFullYear(),
    String(
      now.getMonth() + 1
    ).padStart(2, "0"),
    String(
      now.getDate()
    ).padStart(2, "0"),
  ].join("-");

  const [
    { data: upcomingEventsData },
    { count: todayCount },
    { count: pendingFollowUps },
    { count: overdueFollowUps },
    { count: supportersCount },
    { count: leadersCount },
    { count: newSupportersCount },
    { count: supportersLastSevenDays },
    { data: recentSupportersData },
    { data: recentLeadersData },
    { data: recentEventsData },
  ] = await Promise.all([
    supabase
      .from("campaign_events")
      .select(`
        id,
        title,
        start_at,
        location_name,
        city,
        status
      `)
      .eq(
        "campaign_id",
        campaignId
      )
      .in(
        "status",
        [
          "scheduled",
          "confirmed",
        ]
      )
      .gte(
        "start_at",
        now.toISOString()
      )
      .order(
        "start_at",
        {
          ascending: true,
        }
      )
      .limit(5),

    supabase
      .from("campaign_events")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "campaign_id",
        campaignId
      )
      .gte(
        "start_at",
        todayStart.toISOString()
      )
      .lte(
        "start_at",
        todayEnd.toISOString()
      )
      .neq(
        "status",
        "cancelled"
      ),

    supabase
      .from("campaign_events")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "campaign_id",
        campaignId
      )
      .eq(
        "follow_up_required",
        true
      )
      .is(
        "follow_up_completed_at",
        null
      ),

    supabase
      .from("campaign_events")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "campaign_id",
        campaignId
      )
      .eq(
        "follow_up_required",
        true
      )
      .is(
        "follow_up_completed_at",
        null
      )
      .lt(
        "follow_up_due_date",
        todayDateValue
      ),

    // Total de apoiadores ativos
    supabase
      .from("supporters")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "campaign_id",
        campaignId
      )
      .eq(
        "is_active",
        true
      ),

    // Lideranças ativas
    supabase
      .from("leaders")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "campaign_id",
        campaignId
      )
      .eq(
        "is_active",
        true
      ),

    // Novos apoiadores ativos nas últimas 24h
    supabase
      .from("supporters")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "campaign_id",
        campaignId
      )
      .eq(
        "is_active",
        true
      )
      .gte(
        "created_at",
        twentyFourHoursAgo
          .toISOString()
      ),

    // Apoiadores ativos nos últimos 7 dias
    supabase
      .from("supporters")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "campaign_id",
        campaignId
      )
      .eq(
        "is_active",
        true
      )
      .gte(
        "created_at",
        sevenDaysAgo
          .toISOString()
      ),

    // Atividades recentes - apoiadores ativos
    supabase
      .from("supporters")
      .select(`
        id,
        full_name,
        city,
        created_at
      `)
      .eq(
        "campaign_id",
        campaignId
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(5),

    // Atividades recentes - lideranças ativas
    supabase
      .from("leaders")
      .select(`
        id,
        full_name,
        city,
        created_at
      `)
      .eq(
        "campaign_id",
        campaignId
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(5),

    // Atividades recentes - eventos
    supabase
      .from("campaign_events")
      .select(`
        id,
        title,
        city,
        created_at
      `)
      .eq(
        "campaign_id",
        campaignId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(5),
  ]);

  const totalSupporters =
    supportersCount ?? 0;

  const recentSupporters =
    supportersLastSevenDays ?? 0;

  const growthPercentage =
    totalSupporters > 0
      ? Math.round(
          (
            recentSupporters /
            totalSupporters
          ) * 100
        )
      : 0;

  const supporterActivities:
    RecentActivity[] = (
    recentSupportersData ?? []
  ).map(
    (supporter) => ({
      id: supporter.id,
      type: "supporter",
      title:
        supporter.full_name,
      description:
        supporter.city
          ? `Apoiador cadastrado em ${supporter.city}`
          : "Novo apoiador cadastrado",
      createdAt:
        supporter.created_at,
      href:
        `/dashboard/apoiadores/${supporter.id}`,
    })
  );

  const leaderActivities:
    RecentActivity[] = (
    recentLeadersData ?? []
  ).map(
    (leader) => ({
      id: leader.id,
      type: "leader",
      title:
        leader.full_name,
      description:
        leader.city
          ? `Liderança cadastrada em ${leader.city}`
          : "Nova liderança cadastrada",
      createdAt:
        leader.created_at,
      href:
        `/dashboard/liderancas/${leader.id}`,
    })
  );

  const eventActivities:
    RecentActivity[] = (
    recentEventsData ?? []
  ).map(
    (event) => ({
      id: event.id,
      type: "event",
      title: event.title,
      description:
        event.city
          ? `Compromisso criado em ${event.city}`
          : "Novo compromisso criado",
      createdAt:
        event.created_at,
      href:
        `/dashboard/agenda/${event.id}`,
    })
  );

  const recentActivities = [
    ...supporterActivities,
    ...leaderActivities,
    ...eventActivities,
  ]
    .sort(
      (
        firstActivity,
        secondActivity
      ) =>
        new Date(
          secondActivity.createdAt
        ).getTime() -
        new Date(
          firstActivity.createdAt
        ).getTime()
    )
    .slice(0, 8);

  const indicators = [
    {
      label: "Apoiadores",
      value: String(
        totalSupporters
      ),
      description:
        "Total cadastrado",
      icon: Users,
    },
    {
      label: "Lideranças",
      value: String(
        leadersCount ?? 0
      ),
      description:
        "Lideranças ativas",
      icon: Handshake,
    },
    {
      label: "Novos cadastros",
      value: String(
        newSupportersCount ??
          0
      ),
      description:
        "Nas últimas 24 horas",
      icon: UserPlus,
    },
    {
      label: "Crescimento",
      value:
        `${growthPercentage}%`,
      description:
        "Cadastros nos últimos 7 dias",
      icon: TrendingUp,
    },
  ];

  return (
    <main className="px-5 pb-10 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium capitalize text-slate-500">
              {today}
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#081B33] sm:text-4xl">
              Olá, {firstName}.
            </h1>

            <p className="mt-2 text-slate-500">
              Acompanhe os
              principais movimentos
              da campanha.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#081B33] text-white">
              <CalendarDays
                size={21}
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Agenda de hoje
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {(todayCount ??
                  0) === 0
                  ? "Nenhum compromisso"
                  : (todayCount ??
                        0) ===
                      1
                    ? "1 compromisso"
                    : `${todayCount} compromissos`}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {indicators.map(
            (indicator) => {
              const Icon =
                indicator.icon;

              return (
                <article
                  key={
                    indicator.label
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {
                          indicator.label
                        }
                      </p>

                      <p className="mt-3 text-4xl font-semibold tracking-tight text-[#081B33]">
                        {
                          indicator.value
                        }
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#081B33]/5 text-[#081B33]">
                      <Icon
                        size={21}
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-400">
                    {
                      indicator.description
                    }
                  </p>
                </article>
              );
            }
          )}
        </section>

        <div className="mt-8">
          <AgendaDashboard
            events={
              upcomingEventsData ??
              []
            }
            todayCount={
              todayCount ?? 0
            }
            pendingFollowUps={
              pendingFollowUps ??
              0
            }
            overdueFollowUps={
              overdueFollowUps ??
              0
            }
          />
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <RecentActivities
            activities={
              recentActivities
            }
          />

          <QuickActions
            pendingFollowUps={
              pendingFollowUps ??
              0
            }
            overdueFollowUps={
              overdueFollowUps ??
              0
            }
          />
        </section>
      </div>
    </main>
  );
}