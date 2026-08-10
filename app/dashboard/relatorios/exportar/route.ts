import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { getReportsData } from "../actions";

import type {
  ReportFilters,
  ReportPeriod,
} from "../types";

export const runtime = "nodejs";

type CampaignRelation = {
  id: string;
  name: string | null;
  candidate_name: string | null;
};

type CampaignMembershipRow = {
  campaign_id: string;
  campaigns:
    | CampaignRelation
    | CampaignRelation[]
    | null;
};

type SupporterExportRow = {
  id: string;
  full_name: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  neighborhood: string | null;
  status: string | null;
  origin: string | null;
  created_at: string;
};

type LeaderExportRow = {
  id: string;
  full_name: string;
  profession: string | null;
  city: string | null;
  neighborhood: string | null;
  area_of_influence: string | null;
  estimated_supporters: number | null;
  created_at: string;
};

type EventExportRow = {
  id: string;
  title: string;
  start_at: string;
  location_name: string | null;
  city: string | null;
  status: string | null;
  estimated_audience: number | null;
};

const validPeriods: ReportPeriod[] = [
  "7d",
  "30d",
  "90d",
  "all",
];

const statusLabels: Record<string, string> = {
  lead: "Lead",
  supporter: "Apoiador",
  volunteer: "Voluntário",
  inactive: "Inativo",
};

const originLabels: Record<string, string> = {
  landing_page: "Landing Page",
  manual: "Cadastro manual",
  event: "Evento",
  referral: "Indicação",
  social_media: "Rede social",
  other: "Outro",
};

const eventStatusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

function parsePeriod(
  value: string | null
): ReportPeriod {
  if (
    value &&
    validPeriods.includes(
      value as ReportPeriod
    )
  ) {
    return value as ReportPeriod;
  }

  return "30d";
}

function parseOptionalFilter(
  value: string | null
): string | null {
  const normalized = value?.trim();

  return normalized || null;
}

function getPeriodStart(
  period: ReportPeriod
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

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPeriodLabel(
  period: ReportPeriod
): string {
  const labels: Record<ReportPeriod, string> = {
    "7d": "Últimos 7 dias",
    "30d": "Últimos 30 dias",
    "90d": "Últimos 90 dias",
    all: "Todo o período",
  };

  return labels[period];
}

function slugifyFileName(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function styleTitleRow(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  columnCount: number
) {
  const row = worksheet.getRow(rowNumber);

  row.height = 28;

  for (
    let column = 1;
    column <= columnCount;
    column += 1
  ) {
    const cell = row.getCell(column);

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FF081B33",
      },
    };

    cell.font = {
      color: {
        argb: "FFFFFFFF",
      },
      bold: true,
      size: 12,
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    cell.border = {
      bottom: {
        style: "thin",
        color: {
          argb: "FFD1D5DB",
        },
      },
    };
  }
}

function styleTableHeader(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number
) {
  const row = worksheet.getRow(rowNumber);

  row.height = 24;

  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFE2E8F0",
      },
    };

    cell.font = {
      bold: true,
      color: {
        argb: "FF081B33",
      },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    cell.border = {
      top: {
        style: "thin",
        color: {
          argb: "FFCBD5E1",
        },
      },
      bottom: {
        style: "thin",
        color: {
          argb: "FFCBD5E1",
        },
      },
    };
  });
}

function applyTableStyle(
  worksheet: ExcelJS.Worksheet,
  headerRowNumber: number
) {
  styleTableHeader(
    worksheet,
    headerRowNumber
  );

  worksheet.views = [
    {
      state: "frozen",
      ySplit: headerRowNumber,
    },
  ];

  worksheet.autoFilter = {
    from: {
      row: headerRowNumber,
      column: 1,
    },
    to: {
      row: headerRowNumber,
      column: worksheet.columnCount,
    },
  };

  for (
    let rowNumber =
      headerRowNumber + 1;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const row =
      worksheet.getRow(rowNumber);

    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "top",
        wrapText: true,
      };

      cell.border = {
        bottom: {
          style: "hair",
          color: {
            argb: "FFE2E8F0",
          },
        },
      };
    });

    if (
      (rowNumber -
        headerRowNumber) %
        2 ===
      0
    ) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FFF8FAFC",
          },
        };
      });
    }
  }
}

function configureWorksheet(
  worksheet: ExcelJS.Worksheet
) {
  worksheet.properties.defaultRowHeight =
    20;

  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: {
      left: 0.3,
      right: 0.3,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };

  worksheet.headerFooter.oddFooter =
    "Atlas 360 CRM — Desenvolvido por BP Resultados";
}

export async function GET(
  request: Request
) {
  try {
    const requestUrl = new URL(
      request.url
    );

    const filters: ReportFilters = {
      period: parsePeriod(
        requestUrl.searchParams.get(
          "period"
        )
      ),

      city: parseOptionalFilter(
        requestUrl.searchParams.get(
          "city"
        )
      ),

      neighborhood:
        parseOptionalFilter(
          requestUrl.searchParams.get(
            "neighborhood"
          )
        ),

      status: parseOptionalFilter(
        requestUrl.searchParams.get(
          "status"
        )
      ),
    };

    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          message:
            "Você precisa estar autenticado para exportar o relatório.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: membershipData,
      error: membershipError,
    } = await supabase
      .from("campaign_members")
      .select(`
        campaign_id,
        campaigns (
          id,
          name,
          candidate_name
        )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "Erro ao identificar campanha para exportação:",
        membershipError
      );

      return NextResponse.json(
        {
          message:
            "Não foi possível identificar a campanha.",
        },
        {
          status: 500,
        }
      );
    }

    if (!membershipData?.campaign_id) {
      return NextResponse.json(
        {
          message:
            "Seu usuário não está vinculado a uma campanha ativa.",
        },
        {
          status: 403,
        }
      );
    }

    const membership =
      membershipData as CampaignMembershipRow;

    const campaignData =
      Array.isArray(
        membership.campaigns
      )
        ? membership.campaigns[0]
        : membership.campaigns;

    const campaignId =
      membership.campaign_id;

    const campaignName =
      campaignData?.candidate_name ||
      campaignData?.name ||
      "Campanha eleitoral";

    const periodStart =
      getPeriodStart(filters.period);

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
        status,
        origin,
        created_at
      `)
      .eq(
        "campaign_id",
        campaignId
      )
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", {
        ascending: false,
      });

    if (periodStart) {
      supportersQuery =
        supportersQuery.gte(
          "created_at",
          periodStart.toISOString()
        );
    }

    if (filters.city) {
      supportersQuery =
        supportersQuery.eq(
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
      supportersQuery =
        supportersQuery.eq(
          "status",
          filters.status
        );
    }

    const [
      reports,
      supportersResult,
      leadersResult,
      eventsResult,
    ] = await Promise.all([
      getReportsData(filters),

      supportersQuery,

      supabase
        .from("leaders")
        .select(`
          id,
          full_name,
          profession,
          city,
          neighborhood,
          area_of_influence,
          estimated_supporters,
          created_at
        `)
        .eq(
          "campaign_id",
          campaignId
        )
        .eq("is_active", true)
        .eq("status", "active")
        .order(
          "estimated_supporters",
          {
            ascending: false,
            nullsFirst: false,
          }
        ),

      supabase
        .from("campaign_events")
        .select(`
          id,
          title,
          start_at,
          location_name,
          city,
          status,
          estimated_audience
        `)
        .eq(
          "campaign_id",
          campaignId
        )
        .order("start_at", {
          ascending: false,
        }),
    ]);

    if (supportersResult.error) {
      console.error(
        "Erro ao exportar apoiadores:",
        supportersResult.error
      );

      return NextResponse.json(
        {
          message:
            "Não foi possível carregar os apoiadores.",
        },
        {
          status: 500,
        }
      );
    }

    if (leadersResult.error) {
      console.error(
        "Erro ao exportar lideranças:",
        leadersResult.error
      );

      return NextResponse.json(
        {
          message:
            "Não foi possível carregar as lideranças.",
        },
        {
          status: 500,
        }
      );
    }

    if (eventsResult.error) {
      console.error(
        "Erro ao exportar agenda:",
        eventsResult.error
      );

      return NextResponse.json(
        {
          message:
            "Não foi possível carregar a agenda.",
        },
        {
          status: 500,
        }
      );
    }

    const supporters =
      (supportersResult.data ??
        []) as SupporterExportRow[];

    const leaders =
      (leadersResult.data ??
        []) as LeaderExportRow[];

    const events =
      (eventsResult.data ??
        []) as EventExportRow[];

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      "Atlas 360 CRM";

    workbook.company =
      "BP Resultados";

    workbook.subject =
      "Relatório estratégico da campanha";

    workbook.title =
      `Relatório — ${campaignName}`;

    workbook.description =
      "Relatório estratégico gerado pelo Atlas 360 CRM.";

    workbook.created =
      new Date();

    workbook.modified =
      new Date();

    /*
     * ABA: RESUMO
     */
    const summarySheet =
      workbook.addWorksheet(
        "Resumo",
        {
          properties: {
            tabColor: {
              argb: "FF081B33",
            },
          },
        }
      );

    configureWorksheet(
      summarySheet
    );

    summarySheet.columns = [
      {
        key: "label",
        width: 34,
      },
      {
        key: "value",
        width: 24,
      },
      {
        key: "description",
        width: 55,
      },
    ];

    summarySheet.mergeCells(
      "A1:C2"
    );

    summarySheet.getCell(
      "A1"
    ).value = "ATLAS 360 CRM";

    summarySheet.getCell(
      "A1"
    ).font = {
      bold: true,
      size: 24,
      color: {
        argb: "FFFFFFFF",
      },
    };

    summarySheet.getCell(
      "A1"
    ).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    summarySheet.getCell(
      "A1"
    ).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FF081B33",
      },
    };

    summarySheet.getRow(1).height =
      28;

    summarySheet.getRow(2).height =
      28;

    summarySheet.mergeCells(
      "A4:C4"
    );

    summarySheet.getCell(
      "A4"
    ).value =
      "RELATÓRIO ESTRATÉGICO DA CAMPANHA";

    summarySheet.getCell(
      "A4"
    ).font = {
      bold: true,
      size: 16,
      color: {
        argb: "FF081B33",
      },
    };

    summarySheet.getCell(
      "A4"
    ).alignment = {
      horizontal: "center",
    };

    summarySheet.addRow([]);

    summarySheet.addRow([
      "Campanha",
      campaignName,
      "",
    ]);

    summarySheet.addRow([
      "Período",
      getPeriodLabel(
        filters.period
      ),
      "",
    ]);

    summarySheet.addRow([
      "Cidade",
      filters.city ||
        "Todas as cidades",
      "",
    ]);

    summarySheet.addRow([
      "Bairro",
      filters.neighborhood ||
        "Todos os bairros",
      "",
    ]);

    summarySheet.addRow([
      "Status",
      filters.status
        ? statusLabels[
            filters.status
          ] || filters.status
        : "Todos os status",
      "",
    ]);

    summarySheet.addRow([
      "Gerado em",
      formatDateTime(
        new Date().toISOString()
      ),
      "",
    ]);

    summarySheet.addRow([]);

    const indicatorHeaderRow =
      summarySheet.addRow([
        "Indicador",
        "Valor",
        "Descrição",
      ]).number;

    styleTableHeader(
      summarySheet,
      indicatorHeaderRow
    );

    const indicatorRows = [
      reports.indicators
        .totalSupporters,
      reports.indicators
        .newSupporters,
      reports.indicators
        .activeLeaders,
      reports.indicators
        .completedEvents,
      {
        label:
          "Leads da Landing",
        value:
          reports.landing
            .landingLeads,
        description:
          "Cadastros recebidos pela Landing Page",
      },
      {
        label:
          "Propostas publicadas",
        value:
          reports.landing
            .publishedProposals,
        description:
          "Propostas disponíveis no site",
      },
      {
        label:
          "Notícias publicadas",
        value:
          reports.landing
            .publishedPosts,
        description:
          "Notícias disponíveis no site",
      },
    ];

    for (
      const indicator of indicatorRows
    ) {
      summarySheet.addRow([
        indicator.label,
        indicator.value,
        indicator.description,
      ]);
    }

    summarySheet
      .getColumn(2)
      .numFmt = "#,##0";

    /*
     * ABA: APOIADORES
     */
    const supportersSheet =
      workbook.addWorksheet(
        "Apoiadores",
        {
          properties: {
            tabColor: {
              argb: "FF2563EB",
            },
          },
        }
      );

    configureWorksheet(
      supportersSheet
    );

    supportersSheet.columns = [
      {
        header: "Nome",
        key: "fullName",
        width: 32,
      },
      {
        header: "WhatsApp",
        key: "whatsapp",
        width: 20,
      },
      {
        header: "Telefone",
        key: "phone",
        width: 20,
      },
      {
        header: "E-mail",
        key: "email",
        width: 32,
      },
      {
        header: "Cidade",
        key: "city",
        width: 24,
      },
      {
        header: "Bairro",
        key: "neighborhood",
        width: 24,
      },
      {
        header: "Status",
        key: "status",
        width: 18,
      },
      {
        header: "Origem",
        key: "origin",
        width: 22,
      },
      {
        header: "Data do cadastro",
        key: "createdAt",
        width: 20,
      },
    ];

    supportersSheet.insertRow(
      1,
      [
        `APOIADORES — ${campaignName}`,
      ]
    );

    supportersSheet.mergeCells(
      1,
      1,
      1,
      supportersSheet.columnCount
    );

    styleTitleRow(
      supportersSheet,
      1,
      supportersSheet.columnCount
    );

    supportersSheet.insertRow(
      2,
      []
    );

    for (
      const supporter of supporters
    ) {
      supportersSheet.addRow({
        fullName:
          supporter.full_name,
        whatsapp:
          supporter.whatsapp || "",
        phone:
          supporter.phone || "",
        email:
          supporter.email || "",
        city:
          supporter.city || "",
        neighborhood:
          supporter.neighborhood ||
          "",
        status:
          statusLabels[
            supporter.status || ""
          ] ||
          supporter.status ||
          "",
        origin:
          originLabels[
            supporter.origin || ""
          ] ||
          supporter.origin ||
          "",
        createdAt:
          formatDateTime(
            supporter.created_at
          ),
      });
    }

    applyTableStyle(
      supportersSheet,
      3
    );

    /*
     * ABA: LIDERANÇAS
     */
    const leadersSheet =
      workbook.addWorksheet(
        "Lideranças",
        {
          properties: {
            tabColor: {
              argb: "FF7C3AED",
            },
          },
        }
      );

    configureWorksheet(
      leadersSheet
    );

    leadersSheet.columns = [
      {
        header: "Nome",
        key: "fullName",
        width: 32,
      },
      {
        header: "Profissão",
        key: "profession",
        width: 26,
      },
      {
        header: "Cidade",
        key: "city",
        width: 24,
      },
      {
        header: "Bairro",
        key: "neighborhood",
        width: 24,
      },
      {
        header:
          "Área de influência",
        key: "area",
        width: 38,
      },
      {
        header:
          "Apoiadores estimados",
        key: "estimatedSupporters",
        width: 24,
      },
      {
        header:
          "Data do cadastro",
        key: "createdAt",
        width: 20,
      },
    ];

    leadersSheet.insertRow(
      1,
      [
        `LIDERANÇAS — ${campaignName}`,
      ]
    );

    leadersSheet.mergeCells(
      1,
      1,
      1,
      leadersSheet.columnCount
    );

    styleTitleRow(
      leadersSheet,
      1,
      leadersSheet.columnCount
    );

    leadersSheet.insertRow(
      2,
      []
    );

    for (
      const leader of leaders
    ) {
      leadersSheet.addRow({
        fullName:
          leader.full_name,
        profession:
          leader.profession || "",
        city:
          leader.city || "",
        neighborhood:
          leader.neighborhood ||
          "",
        area:
          leader.area_of_influence ||
          "",
        estimatedSupporters:
          leader.estimated_supporters ??
          0,
        createdAt:
          formatDateTime(
            leader.created_at
          ),
      });
    }

    applyTableStyle(
      leadersSheet,
      3
    );

    leadersSheet
      .getColumn(
        "estimatedSupporters"
      )
      .numFmt = "#,##0";

    /*
     * ABA: AGENDA
     */
    const agendaSheet =
      workbook.addWorksheet(
        "Agenda",
        {
          properties: {
            tabColor: {
              argb: "FFF59E0B",
            },
          },
        }
      );

    configureWorksheet(
      agendaSheet
    );

    agendaSheet.columns = [
      {
        header: "Evento",
        key: "title",
        width: 38,
      },
      {
        header: "Data",
        key: "startAt",
        width: 22,
      },
      {
        header: "Local",
        key: "locationName",
        width: 30,
      },
      {
        header: "Cidade",
        key: "city",
        width: 24,
      },
      {
        header: "Status",
        key: "status",
        width: 18,
      },
      {
        header:
          "Público estimado",
        key: "estimatedAudience",
        width: 22,
      },
    ];

    agendaSheet.insertRow(
      1,
      [
        `AGENDA — ${campaignName}`,
      ]
    );

    agendaSheet.mergeCells(
      1,
      1,
      1,
      agendaSheet.columnCount
    );

    styleTitleRow(
      agendaSheet,
      1,
      agendaSheet.columnCount
    );

    agendaSheet.insertRow(
      2,
      []
    );

    for (
      const event of events
    ) {
      agendaSheet.addRow({
        title: event.title,
        startAt:
          formatDateTime(
            event.start_at
          ),
        locationName:
          event.location_name || "",
        city:
          event.city || "",
        status:
          eventStatusLabels[
            event.status || ""
          ] ||
          event.status ||
          "",
        estimatedAudience:
          event.estimated_audience ??
          0,
      });
    }

    applyTableStyle(
      agendaSheet,
      3
    );

    agendaSheet
      .getColumn(
        "estimatedAudience"
      )
      .numFmt = "#,##0";

    /*
     * ABA: CIDADES
     */
    const citiesSheet =
      workbook.addWorksheet(
        "Cidades"
      );

    configureWorksheet(
      citiesSheet
    );

    citiesSheet.columns = [
      {
        header: "Posição",
        key: "position",
        width: 12,
      },
      {
        header: "Cidade",
        key: "name",
        width: 34,
      },
      {
        header: "Apoiadores",
        key: "total",
        width: 18,
      },
      {
        header: "Percentual",
        key: "percentage",
        width: 18,
      },
    ];

    reports.cities.forEach(
      (item, index) => {
        citiesSheet.addRow({
          position: index + 1,
          name: item.name,
          total: item.total,
          percentage:
            item.percentage / 100,
        });
      }
    );

    applyTableStyle(
      citiesSheet,
      1
    );

    citiesSheet
      .getColumn("percentage")
      .numFmt = "0%";

    /*
     * ABA: BAIRROS
     */
    const neighborhoodsSheet =
      workbook.addWorksheet(
        "Bairros"
      );

    configureWorksheet(
      neighborhoodsSheet
    );

    neighborhoodsSheet.columns = [
      {
        header: "Posição",
        key: "position",
        width: 12,
      },
      {
        header: "Bairro",
        key: "name",
        width: 34,
      },
      {
        header: "Apoiadores",
        key: "total",
        width: 18,
      },
      {
        header: "Percentual",
        key: "percentage",
        width: 18,
      },
    ];

    reports.neighborhoods.forEach(
      (item, index) => {
        neighborhoodsSheet.addRow({
          position: index + 1,
          name: item.name,
          total: item.total,
          percentage:
            item.percentage / 100,
        });
      }
    );

    applyTableStyle(
      neighborhoodsSheet,
      1
    );

    neighborhoodsSheet
      .getColumn("percentage")
      .numFmt = "0%";

    /*
     * ABA: ORIGENS
     */
    const originsSheet =
      workbook.addWorksheet(
        "Origens"
      );

    configureWorksheet(
      originsSheet
    );

    originsSheet.columns = [
      {
        header: "Origem",
        key: "label",
        width: 30,
      },
      {
        header: "Cadastros",
        key: "total",
        width: 18,
      },
      {
        header: "Percentual",
        key: "percentage",
        width: 18,
      },
    ];

    for (
      const origin of reports.origins
    ) {
      originsSheet.addRow({
        label: origin.label,
        total: origin.total,
        percentage:
          origin.percentage / 100,
      });
    }

    applyTableStyle(
      originsSheet,
      1
    );

    originsSheet
      .getColumn("percentage")
      .numFmt = "0%";

    /*
     * ABA: STATUS
     */
    const statusesSheet =
      workbook.addWorksheet(
        "Status"
      );

    configureWorksheet(
      statusesSheet
    );

    statusesSheet.columns = [
      {
        header: "Status",
        key: "label",
        width: 30,
      },
      {
        header: "Cadastros",
        key: "total",
        width: 18,
      },
      {
        header: "Percentual",
        key: "percentage",
        width: 18,
      },
    ];

    for (
      const status of reports.statuses
    ) {
      statusesSheet.addRow({
        label: status.label,
        total: status.total,
        percentage:
          status.percentage / 100,
      });
    }

    applyTableStyle(
      statusesSheet,
      1
    );

    statusesSheet
      .getColumn("percentage")
      .numFmt = "0%";

    const fileBuffer =
      await workbook.xlsx.writeBuffer();

    const todayFileName =
      new Intl.DateTimeFormat(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      )
        .format(new Date())
        .replace(/\//g, "-");

    const fileName =
      `Relatorio-Atlas-${slugifyFileName(
        campaignName
      )}-${todayFileName}.xlsx`;

    return new NextResponse(
      new Uint8Array(fileBuffer),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="${encodeURIComponent(
              fileName
            )}"`,

          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Erro ao gerar relatório em Excel:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível gerar a planilha.",
      },
      {
        status: 500,
      }
    );
  }
}