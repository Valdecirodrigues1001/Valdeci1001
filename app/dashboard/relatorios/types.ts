export type ReportPeriod =
  | "7d"
  | "30d"
  | "90d"
  | "all";

export type ReportFilters = {
  period: ReportPeriod;
  city: string | null;
  neighborhood: string | null;
  status: string | null;
};

export type ReportIndicator = {
  label: string;
  value: number;
  description: string;
  variation?: number | null;
};

export type GrowthDataPoint = {
  date: string;
  label: string;
  total: number;
};

export type OriginDataPoint = {
  origin: string;
  label: string;
  total: number;
  percentage: number;
};

export type StatusDataPoint = {
  status: string;
  label: string;
  total: number;
  percentage: number;
};

export type LocationDataPoint = {
  name: string;
  total: number;
  percentage: number;
};

export type LeaderReportItem = {
  id: string;
  full_name: string;
  city: string | null;
  neighborhood: string | null;
  area_of_influence: string | null;
  estimated_supporters: number;
};

export type AgendaReport = {
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  estimatedAudience: number;
  averageAudience: number;
};

export type LandingReport = {
  landingLeads: number;
  publishedProposals: number;
  publishedPosts: number;
  totalPublicContent: number;
};

export type ReportsData = {
  indicators: {
    totalSupporters: ReportIndicator;
    newSupporters: ReportIndicator;
    activeLeaders: ReportIndicator;
    completedEvents: ReportIndicator;
  };

  growth: GrowthDataPoint[];
  origins: OriginDataPoint[];
  statuses: StatusDataPoint[];

  cities: LocationDataPoint[];
  neighborhoods: LocationDataPoint[];

  leaders: LeaderReportItem[];

  agenda: AgendaReport;
  landing: LandingReport;

  availableFilters: {
    cities: string[];
    neighborhoods: string[];
    statuses: string[];
  };
};