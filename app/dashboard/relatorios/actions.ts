"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  AgendaReport,
  GrowthDataPoint,
  LandingReport,
  LeaderReportItem,
  LocationDataPoint,
  OriginDataPoint,
  ReportFilters,
  ReportsData,
  StatusDataPoint,
} from "./types";

type CampaignContext = {
  campaignId: string;
};

type SupporterReportRow = {
  id: string;
  status: string | null;
  origin: string | null;
  city: string | null;
  neighborhood: string | null;
  created_at: string;
};

type EventReportRow = {
  id: string;
  status: string | null;
  estimated_audience: number | null;
};

const originLabels: Record<string, string> = {
  landing_page: "Landing Page",
  manual: "Cadastro manual",
  event: "Evento",
  referral: "Indicação",
  social_media: "Rede social",
  other: "Outro",
};

const statusLabels: Record<string, string> = {
  lead: "Lead",
  supporter: "Apoiador",
  volunteer: "Voluntário",
  inactive: "Inativo",
};

async function getCampaignContext(): Promise<CampaignContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: membership, error } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao identificar campanha nos relatórios:",
      error
    );

    throw new Error(
      "Não foi possível identificar a campanha."
    );
  }

  if (!membership?.campaign_id) {
    throw new Error(
      "Seu usuário não está vinculado a uma campanha ativa."
    );
  }

  return {
    campaignId: membership.campaign_id,
  };
}

function getPeriodStart(
  period: ReportFilters["period"]
): Date | null {
  if (period === "all") {
    return null;
  }

  const date = new Date();

  if (period === "7d") {
    date.setDate(date.getDate() - 6);
  }

  if (period === "30d") {
    date.setDate(date.getDate() - 29);
  }

  if (period === "90d") {
    date.setDate(date.getDate() - 89);
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

function formatDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function calculatePercentage(
  value: number,
  total: number
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function normalizeLocation(
  value: string | null
): string | null {
  const normalized = value?.trim();

  return normalized || null;
}

function buildGrowthData(
  supporters: SupporterReportRow[],
  period: ReportFilters["period"]
): GrowthDataPoint[] {
  const now = new Date();

  const days =
    period === "7d"
      ? 7
      : period === "30d"
        ? 30
        : period === "90d"
          ? 90
          : 30;

  const totalsByDate = new Map<string, number>();

  for (const supporter of supporters) {
    const date = new Date(supporter.created_at);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = formatDateKey(date);

    totalsByDate.set(
      key,
      (totalsByDate.get(key) ?? 0) + 1
    );
  }

  const result: GrowthDataPoint[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);

    date.setDate(now.getDate() - index);
    date.setHours(0, 0, 0, 0);

    const key = formatDateKey(date);

    result.push({
      date: key,
      label: formatShortDate(date),
      total: totalsByDate.get(key) ?? 0,
    });
  }

  return result;
}

function buildOriginData(
  supporters: SupporterReportRow[]
): OriginDataPoint[] {
  const totals = new Map<string, number>();

  for (const supporter of supporters) {
    const origin = supporter.origin || "other";

    totals.set(
      origin,
      (totals.get(origin) ?? 0) + 1
    );
  }

  return Array.from(totals.entries())
    .map(([origin, total]) => ({
      origin,
      label: originLabels[origin] || origin,
      total,
      percentage: calculatePercentage(
        total,
        supporters.length
      ),
    }))
    .sort(
      (first, second) =>
        second.total - first.total
    );
}

function buildStatusData(
  supporters: SupporterReportRow[]
): StatusDataPoint[] {
  const totals = new Map<string, number>();

  for (const supporter of supporters) {
    const status = supporter.status || "lead";

    totals.set(
      status,
      (totals.get(status) ?? 0) + 1
    );
  }

  return Array.from(totals.entries())
    .map(([status, total]) => ({
      status,
      label: statusLabels[status] || status,
      total,
      percentage: calculatePercentage(
        total,
        supporters.length
      ),
    }))
    .sort(
      (first, second) =>
        second.total - first.total
    );
}

function buildLocationData(
  supporters: SupporterReportRow[],
  field: "city" | "neighborhood"
): LocationDataPoint[] {
  const totals = new Map<string, number>();

  for (const supporter of supporters) {
    const location = normalizeLocation(
      supporter[field]
    );

    if (!location) {
      continue;
    }

    totals.set(
      location,
      (totals.get(location) ?? 0) + 1
    );
  }

  const totalWithLocation = Array.from(
    totals.values()
  ).reduce(
    (sum, current) => sum + current,
    0
  );

  return Array.from(totals.entries())
    .map(([name, total]) => ({
      name,
      total,
      percentage: calculatePercentage(
        total,
        totalWithLocation
      ),
    }))
    .sort(
      (first, second) =>
        second.total - first.total
    )
    .slice(0, 10);
}

function buildAgendaReport(
  events: EventReportRow[]
): AgendaReport {
  const upcomingEvents = events.filter(
    (event) =>
      event.status === "scheduled" ||
      event.status === "confirmed"
  ).length;

  const completedEvents = events.filter(
    (event) => event.status === "completed"
  ).length;

  const cancelledEvents = events.filter(
    (event) => event.status === "cancelled"
  ).length;

  const completedAudience = events
    .filter(
      (event) => event.status === "completed"
    )
    .reduce(
      (sum, event) =>
        sum + (event.estimated_audience ?? 0),
      0
    );

  const averageAudience =
    completedEvents > 0
      ? Math.round(
          completedAudience / completedEvents
        )
      : 0;

  return {
    upcomingEvents,
    completedEvents,
    cancelledEvents,
    estimatedAudience: completedAudience,
    averageAudience,
  };
}

export async function getReportsData(
  filters: ReportFilters
): Promise<ReportsData> {
  const supabase = await createClient();

  const { campaignId } =
    await getCampaignContext();

  const periodStart = getPeriodStart(
    filters.period
  );

  let supportersQuery = supabase
    .from("supporters")
    .select(`
      id,
      status,
      origin,
      city,
      neighborhood,
      created_at
    `)
    .eq("campaign_id", campaignId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", {
      ascending: true,
    });

  if (periodStart) {
    supportersQuery = supportersQuery.gte(
      "created_at",
      periodStart.toISOString()
    );
  }

  if (filters.city) {
    supportersQuery = supportersQuery.eq(
      "city",
      filters.city
    );
  }

  if (filters.neighborhood) {
    supportersQuery =
      supportersQuery.eq(
        "neighborhood",
        filters.neighborhood
      );
  }

  if (filters.status) {
    supportersQuery = supportersQuery.eq(
      "status",
      filters.status
    );
  }

  const [
    supportersResult,
    leadersResult,
    eventsResult,
    landingLeadsResult,
    proposalsResult,
    postsResult,
    allLocationsResult,
  ] = await Promise.all([
    supportersQuery,

    supabase
      .from("leaders")
      .select(`
        id,
        full_name,
        city,
        neighborhood,
        area_of_influence,
        estimated_supporters
      `)
      .eq("campaign_id", campaignId)
      .eq("is_active", true)
      .eq("status", "active")
      .order("estimated_supporters", {
        ascending: false,
        nullsFirst: false,
      }),

    supabase
      .from("campaign_events")
      .select(`
        id,
        status,
        estimated_audience
      `)
      .eq("campaign_id", campaignId),

    supabase
      .from("supporters")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("campaign_id", campaignId)
      .eq("origin", "landing_page")
      .eq("is_active", true)
      .is("deleted_at", null),

    supabase
      .from("campaign_proposals")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("campaign_id", campaignId)
      .eq("is_published", true),

    supabase
      .from("campaign_posts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("campaign_id", campaignId)
      .eq("status", "published"),

    supabase
      .from("supporters")
      .select(`
        city,
        neighborhood,
        status
      `)
      .eq("campaign_id", campaignId)
      .eq("is_active", true)
      .is("deleted_at", null),
  ]);

  if (supportersResult.error) {
    console.error(
      "Erro ao buscar apoiadores dos relatórios:",
      supportersResult.error
    );

    throw new Error(
      "Não foi possível carregar os dados dos apoiadores."
    );
  }

  if (leadersResult.error) {
    console.error(
      "Erro ao buscar lideranças dos relatórios:",
      leadersResult.error
    );
  }

  if (eventsResult.error) {
    console.error(
      "Erro ao buscar agenda dos relatórios:",
      eventsResult.error
    );
  }

  if (allLocationsResult.error) {
    console.error(
      "Erro ao buscar filtros dos relatórios:",
      allLocationsResult.error
    );
  }

  const supporters =
    (supportersResult.data ??
      []) as SupporterReportRow[];

  const leaders =
    (leadersResult.data ??
      []) as LeaderReportItem[];

  const events =
    (eventsResult.data ??
      []) as EventReportRow[];

  const allLocations =
    allLocationsResult.data ?? [];

  const cities = Array.from(
    new Set(
      allLocations
        .map((item) =>
          normalizeLocation(item.city)
        )
        .filter(
          (value): value is string =>
            Boolean(value)
        )
    )
  ).sort((first, second) =>
    first.localeCompare(second, "pt-BR")
  );

  const neighborhoods = Array.from(
    new Set(
      allLocations
        .map((item) =>
          normalizeLocation(
            item.neighborhood
          )
        )
        .filter(
          (value): value is string =>
            Boolean(value)
        )
    )
  ).sort((first, second) =>
    first.localeCompare(second, "pt-BR")
  );

  const statuses = Array.from(
    new Set(
      allLocations
        .map((item) => item.status)
        .filter(
          (value): value is string =>
            Boolean(value)
        )
    )
  );

  const completedEvents = events.filter(
    (event) =>
      event.status === "completed"
  ).length;

  const landing: LandingReport = {
    landingLeads:
      landingLeadsResult.count ?? 0,

    publishedProposals:
      proposalsResult.count ?? 0,

    publishedPosts:
      postsResult.count ?? 0,

    totalPublicContent:
      (proposalsResult.count ?? 0) +
      (postsResult.count ?? 0),
  };

  return {
    indicators: {
      totalSupporters: {
        label: "Apoiadores",
        value: supporters.length,
        description:
          "Contatos encontrados no período",
      },

      newSupporters: {
        label: "Novos cadastros",
        value: supporters.length,
        description:
          filters.period === "all"
            ? "Todos os cadastros"
            : "Cadastros no período selecionado",
      },

      activeLeaders: {
        label: "Lideranças",
        value: leaders.length,
        description: "Lideranças ativas",
      },

      completedEvents: {
        label: "Eventos realizados",
        value: completedEvents,
        description:
          "Compromissos concluídos",
      },
    },

    growth: buildGrowthData(
      supporters,
      filters.period
    ),

    origins: buildOriginData(
      supporters
    ),

    statuses: buildStatusData(
      supporters
    ),

    cities: buildLocationData(
      supporters,
      "city"
    ),

    neighborhoods: buildLocationData(
      supporters,
      "neighborhood"
    ),

    leaders,

    agenda: buildAgendaReport(events),

    landing,

    availableFilters: {
      cities,
      neighborhoods,
      statuses,
    },
  };
}