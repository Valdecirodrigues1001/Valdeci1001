"use server";

import { revalidatePath } from "next/cache";

import { checkPermission } from "@/lib/auth/campaign-access";
import { createClient } from "@/lib/supabase/server";

export type CrmStage =
  | "new"
  | "contact"
  | "negotiation"
  | "confirmed"
  | "volunteer"
  | "leader";

const validStages: CrmStage[] = [
  "new",
  "contact",
  "negotiation",
  "confirmed",
  "volunteer",
  "leader",
];

export async function updateSupporterCrmStage(
  supporterId: string,
  crmStage: CrmStage
) {
  const { allowed } =
    await checkPermission("crm.manage");

  if (!allowed) {
    return {
      success: false,
      error:
        "Você não possui permissão para alterar o CRM.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Sua sessão expirou.",
    };
  }

  if (!supporterId) {
    return {
      success: false,
      error: "Apoiador inválido.",
    };
  }

  if (!validStages.includes(crmStage)) {
    return {
      success: false,
      error: "Etapa inválida.",
    };
  }

  const { data: membership } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return {
      success: false,
      error: "Campanha não encontrada.",
    };
  }

  const { data: supporter } = await supabase
    .from("supporters")
    .select("id, crm_stage")
    .eq("id", supporterId)
    .eq(
      "campaign_id",
      membership.campaign_id
    )
    .eq("is_active", true)
    .maybeSingle();

  if (!supporter) {
    return {
      success: false,
      error: "Apoiador não encontrado.",
    };
  }

  const supporterUpdates: {
    crm_stage: CrmStage;
    crm_stage_updated_at: string;
    status?:
      | "lead"
      | "supporter"
      | "volunteer";
    is_leader?: boolean;
  } = {
    crm_stage: crmStage,
    crm_stage_updated_at:
      new Date().toISOString(),
  };

  if (crmStage === "new") {
    supporterUpdates.status = "lead";
    supporterUpdates.is_leader = false;
  }

  if (
    crmStage === "contact" ||
    crmStage === "negotiation"
  ) {
    supporterUpdates.status = "lead";
    supporterUpdates.is_leader = false;
  }

  if (crmStage === "confirmed") {
    supporterUpdates.status = "supporter";
    supporterUpdates.is_leader = false;
  }

  if (crmStage === "volunteer") {
    supporterUpdates.status = "volunteer";
    supporterUpdates.is_leader = false;
  }

  if (crmStage === "leader") {
    supporterUpdates.status = "supporter";
    supporterUpdates.is_leader = true;
  }

  const { error: updateError } = await supabase
    .from("supporters")
    .update(supporterUpdates)
    .eq("id", supporterId)
    .eq(
      "campaign_id",
      membership.campaign_id
    );

  if (updateError) {
    console.error(
      "Erro ao atualizar etapa do CRM:",
      updateError
    );

    return {
      success: false,
      error:
        "Não foi possível atualizar a etapa.",
    };
  }

  await supabase
    .from("supporter_activities")
    .insert({
      campaign_id:
        membership.campaign_id,
      supporter_id: supporterId,
      activity_type:
        "crm_stage_changed",
      title: "Etapa do CRM alterada",
      description: `Etapa alterada de ${
        supporter.crm_stage ?? "new"
      } para ${crmStage}.`,
      created_by: user.id,
    });

  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/apoiadores");
  revalidatePath(
    `/dashboard/apoiadores/${supporterId}`
  );

  return {
    success: true,
  };
}