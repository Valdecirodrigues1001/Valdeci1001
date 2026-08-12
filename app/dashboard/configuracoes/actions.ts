"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/campaign-access";

import type {
  CampaignModuleSettings,
  CampaignSettings,
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
      `Não foi possível carregar as configurações: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  const campaign: CampaignSettings = {
    id: data.id,
    campaign_id: data.campaign_id,

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