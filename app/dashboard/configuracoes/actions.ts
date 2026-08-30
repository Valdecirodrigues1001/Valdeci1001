"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/campaign-access";

import type {
  CampaignModuleSettings,
  CampaignSettings,
  RegionalGroup,
  SettingsPageData,
} from "./types";

const DEFAULT_MODULES: CampaignModuleSettings = {
  supporters: true,
  volunteers: true,
  leaders: true,
  events: true,
  news: true,
  proposals: true,
  gallery: true,
  materials: true,
  whatsapp_groups: true,
};

async function getCurrentCampaignId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sua sessão expirou.");
  }

  const { data: membership, error } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar campanha do usuário:",
      error
    );

    throw new Error(
      "Não foi possível identificar a campanha."
    );
  }

  if (!membership?.campaign_id) {
    throw new Error("Campanha não encontrada.");
  }

  return membership.campaign_id as string;
}

export async function getSettingsPageData(): Promise<SettingsPageData | null> {
  const supabase = await createClient();

  const campaignId = await getCurrentCampaignId();

  const { data, error } = await supabase
    .from("campaign_landing_pages")
    .select("*")
    .eq("campaign_id", campaignId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar configurações:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      "Não foi possível carregar as configurações."
    );
  }

  if (!data) {
    return null;
  }

  const campaign: CampaignSettings = {
    id: data.id,
    campaign_id: data.campaign_id,
    slug: data.slug ?? null,

    public_name: data.public_name ?? "",
    political_position:
      data.political_position ?? null,
    campaign_number:
      data.campaign_number ?? null,
    political_party:
      data.political_party ?? null,
    city: data.city ?? null,
    state: data.state ?? null,
    slogan: data.slogan ?? null,

    logo_url: data.logo_url ?? null,
    primary_color:
      data.primary_color ?? null,
    secondary_color:
      data.secondary_color ?? null,
    contrast_color:
      data.contrast_color ?? null,
    background_color:
      data.background_color ?? null,
    text_color:
      data.text_color ?? null,

    whatsapp: data.whatsapp ?? null,
    email: data.email ?? null,
    instagram_url:
      data.instagram_url ?? null,
    facebook_url:
      data.facebook_url ?? null,
    youtube_url:
      data.youtube_url ?? null,
    tiktok_url:
      data.tiktok_url ?? null,
    x_url: data.x_url ?? null,

    custom_domain:
      data.custom_domain ?? null,
    seo_title:
      data.seo_title ?? null,
    seo_description:
      data.seo_description ?? null,
    seo_keywords:
      data.seo_keywords ?? null,

    meta_pixel_id:
      data.meta_pixel_id ?? null,
    ga4_measurement_id:
      data.ga4_measurement_id ?? null,
    google_ads_tag_id:
      data.google_ads_tag_id ?? null,
    google_ads_conversion_label:
      data.google_ads_conversion_label ?? null,

    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  const modules: CampaignModuleSettings = {
    ...DEFAULT_MODULES,
    ...(data.module_settings ?? {}),
  };

  return {
    campaign,
    modules,
  };
}

export async function updateCampaignSettings(
  input: Partial<CampaignSettings>
) {
  const { allowed } =
    await checkPermission("settings.manage");

  if (!allowed) {
    return {
      success: false,
      message:
        "Você não possui permissão para alterar as configurações.",
    };
  }

  const supabase = await createClient();

  const campaignId = await getCurrentCampaignId();

  const {
    id: _id,
    campaign_id: _campaignId,
    slug: _slug,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...payload
  } = input;

  const { error } = await supabase
    .from("campaign_landing_pages")
    .update(payload)
    .eq("campaign_id", campaignId);

  if (error) {
    console.error(
      "Erro ao atualizar configurações:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    return {
      success: false,
      message:
        "Não foi possível salvar as configurações.",
    };
  }

  revalidatePath(
    "/dashboard/configuracoes"
  );

  return {
    success: true,
    message:
      "Configurações atualizadas com sucesso.",
  };
}

/* ============================================================
 * GRUPOS DE WHATSAPP POR REGIÃO (DDD)
 *
 * Guardados em campaign_areas. O formulário público de apoio
 * usa o DDD do WhatsApp informado para achar o grupo da região
 * (ver app/c/[slug]/support-actions.ts).
 * ==========================================================*/

export type RegionalGroupActionState = {
  success: boolean;
  message: string;
};

function normalizeDdd(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

export async function getRegionalGroups(): Promise<
  RegionalGroup[]
> {
  const supabase = await createClient();

  const campaignId = await getCurrentCampaignId();

  const { data, error } = await supabase
    .from("campaign_areas")
    .select("id, name, ddd, whatsapp_group_url")
    .eq("campaign_id", campaignId)
    .eq("is_active", true)
    .not("ddd", "is", null)
    .order("ddd", { ascending: true });

  if (error) {
    console.error(
      "Erro ao carregar grupos regionais:",
      error
    );

    return [];
  }

  return (data ?? []) as RegionalGroup[];
}

export async function saveRegionalGroup(input: {
  id?: string | null;
  name: string;
  ddd: string;
  whatsapp_group_url: string;
}): Promise<RegionalGroupActionState> {
  const { allowed } = await checkPermission(
    "settings.manage"
  );

  if (!allowed) {
    return {
      success: false,
      message:
        "Você não possui permissão para alterar os grupos.",
    };
  }

  const name = input.name.trim();
  const ddd = normalizeDdd(input.ddd);
  const url = input.whatsapp_group_url.trim();

  if (!name) {
    return {
      success: false,
      message: "Informe o nome da região.",
    };
  }

  if (!/^\d{2}$/.test(ddd)) {
    return {
      success: false,
      message: "Informe um DDD com 2 dígitos.",
    };
  }

  if (!/^https?:\/\//i.test(url)) {
    return {
      success: false,
      message:
        "Informe o link completo do grupo (começando com https://).",
    };
  }

  const supabase = await createClient();

  const campaignId = await getCurrentCampaignId();

  /* DDD único por campanha. */
  const { data: conflict } = await supabase
    .from("campaign_areas")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("ddd", ddd)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (conflict && conflict.id !== input.id) {
    return {
      success: false,
      message: `Já existe um grupo com o DDD ${ddd} nesta campanha.`,
    };
  }

  if (input.id) {
    const { error } = await supabase
      .from("campaign_areas")
      .update({
        name,
        ddd,
        whatsapp_group_url: url,
      })
      .eq("id", input.id)
      .eq("campaign_id", campaignId);

    if (error) {
      console.error(
        "Erro ao atualizar grupo regional:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível salvar o grupo.",
      };
    }
  } else {
    const { error } = await supabase
      .from("campaign_areas")
      .insert({
        campaign_id: campaignId,
        name,
        area_type: "region",
        ddd,
        whatsapp_group_url: url,
        supporters_goal: 0,
        visits_goal: 0,
        is_active: true,
      });

    if (error) {
      console.error(
        "Erro ao cadastrar grupo regional:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível cadastrar o grupo.",
      };
    }
  }

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard/mobilizacao");

  return {
    success: true,
    message: input.id
      ? "Grupo atualizado com sucesso."
      : "Grupo cadastrado com sucesso.",
  };
}

export async function deleteRegionalGroup(
  id: string
): Promise<RegionalGroupActionState> {
  const { allowed } = await checkPermission(
    "settings.manage"
  );

  if (!allowed) {
    return {
      success: false,
      message:
        "Você não possui permissão para remover grupos.",
    };
  }

  if (!id) {
    return {
      success: false,
      message: "Grupo inválido.",
    };
  }

  const supabase = await createClient();

  const campaignId = await getCurrentCampaignId();

  const { error } = await supabase
    .from("campaign_areas")
    .delete()
    .eq("id", id)
    .eq("campaign_id", campaignId);

  if (error) {
    /*
     * Região com apoiadores vinculados não pode ser
     * excluída. Nesse caso apenas removemos os dados do
     * grupo — a área continua na Mobilização.
     */
    if (error.code === "23503") {
      const { error: clearError } = await supabase
        .from("campaign_areas")
        .update({
          ddd: null,
          whatsapp_group_url: null,
        })
        .eq("id", id)
        .eq("campaign_id", campaignId);

      if (clearError) {
        console.error(
          "Erro ao limpar grupo regional:",
          clearError
        );

        return {
          success: false,
          message:
            "Não foi possível remover o grupo.",
        };
      }

      revalidatePath("/dashboard/configuracoes");
      revalidatePath("/dashboard/mobilizacao");

      return {
        success: true,
        message:
          "Grupo removido. A região foi mantida por ter apoiadores vinculados.",
      };
    }

    console.error(
      "Erro ao remover grupo regional:",
      error
    );

    return {
      success: false,
      message: "Não foi possível remover o grupo.",
    };
  }

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard/mobilizacao");

  return {
    success: true,
    message: "Grupo removido.",
  };
}

export async function updateModuleSettings(
  modules: CampaignModuleSettings
) {
  const { allowed } =
    await checkPermission("settings.manage");

  if (!allowed) {
    return {
      success: false,
      message:
        "Você não possui permissão para alterar os módulos.",
    };
  }

  const supabase = await createClient();

  const campaignId = await getCurrentCampaignId();

  const { error } = await supabase
    .from("campaign_landing_pages")
    .update({
      module_settings: modules,
    })
    .eq("campaign_id", campaignId);

  if (error) {
    console.error(
      "Erro ao atualizar módulos:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar os módulos.",
    };
  }

  revalidatePath(
    "/dashboard/configuracoes"
  );

  return {
    success: true,
    message:
      "Módulos atualizados com sucesso.",
  };
}