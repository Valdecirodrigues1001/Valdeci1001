"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LeaderActionState = {
  success?: string;
  error?: string;
};

async function getCurrentCampaign() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      campaignId: null,
    };
  }

  const { data: membership } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    user,
    campaignId: membership?.campaign_id ?? null,
  };
}

export async function createLeader(
  _previousState: LeaderActionState,
  formData: FormData
): Promise<LeaderActionState> {
  const { supabase, user, campaignId } = await getCurrentCampaign();

  if (!user || !campaignId) {
    return {
      error: "Não foi possível identificar sua campanha.",
    };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!fullName) {
    return {
      error: "Informe o nome completo da liderança.",
    };
  }

  const estimatedSupportersValue = Number(
    formData.get("estimated_supporters") ?? 0
  );

  const estimatedSupporters = Number.isNaN(estimatedSupportersValue)
    ? 0
    : Math.max(0, estimatedSupportersValue);

  const parentLeaderId = String(
    formData.get("parent_leader_id") ?? ""
  ).trim();

  const { data: leader, error } = await supabase
    .from("leaders")
    .insert({
      campaign_id: campaignId,
      parent_leader_id: parentLeaderId || null,
      full_name: fullName,
      whatsapp:
        String(formData.get("whatsapp") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      profession:
        String(formData.get("profession") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      neighborhood:
        String(formData.get("neighborhood") ?? "").trim() || null,
      area_of_influence:
        String(formData.get("area_of_influence") ?? "").trim() ||
        null,
      estimated_supporters: estimatedSupporters,
      status: String(formData.get("status") ?? "active"),
      notes: String(formData.get("notes") ?? "").trim() || null,
      created_by: user.id,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !leader) {
    console.error("Erro ao cadastrar liderança:", error);

    return {
      error: "Não foi possível cadastrar a liderança.",
    };
  }

  await supabase.from("leader_activities").insert({
    campaign_id: campaignId,
    leader_id: leader.id,
    activity_type: "created",
    title: "Liderança cadastrada",
    description: "Cadastro realizado pelo painel da campanha.",
    created_by: user.id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/liderancas");

  return {
    success: "Liderança cadastrada com sucesso.",
  };
}