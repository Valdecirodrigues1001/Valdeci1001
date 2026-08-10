"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LeaderDetailState = {
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

export async function updateLeader(
  leaderId: string,
  _previousState: LeaderDetailState,
  formData: FormData
): Promise<LeaderDetailState> {
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

  const parentLeaderId = String(
    formData.get("parent_leader_id") ?? ""
  ).trim();

  if (parentLeaderId === leaderId) {
    return {
      error: "Uma liderança não pode ser responsável por ela mesma.",
    };
  }

  const estimatedValue = Number(
    formData.get("estimated_supporters") ?? 0
  );

  const estimatedSupporters = Number.isNaN(estimatedValue)
    ? 0
    : Math.max(0, estimatedValue);

  const birthDate = String(
    formData.get("birth_date") ?? ""
  ).trim();

  const { error } = await supabase
    .from("leaders")
    .update({
      parent_leader_id: parentLeaderId || null,
      full_name: fullName,
      whatsapp:
        String(formData.get("whatsapp") ?? "").trim() || null,
      phone:
        String(formData.get("phone") ?? "").trim() || null,
      email:
        String(formData.get("email") ?? "").trim() || null,
      birth_date: birthDate || null,
      profession:
        String(formData.get("profession") ?? "").trim() || null,

      city:
        String(formData.get("city") ?? "").trim() || null,
      neighborhood:
        String(formData.get("neighborhood") ?? "").trim() || null,
      street:
        String(formData.get("street") ?? "").trim() || null,
      street_number:
        String(formData.get("street_number") ?? "").trim() || null,
      complement:
        String(formData.get("complement") ?? "").trim() || null,
      postal_code:
        String(formData.get("postal_code") ?? "").trim() || null,

      instagram:
        String(formData.get("instagram") ?? "").trim() || null,
      facebook:
        String(formData.get("facebook") ?? "").trim() || null,

      area_of_influence:
        String(formData.get("area_of_influence") ?? "").trim() ||
        null,
      estimated_supporters: estimatedSupporters,
      status: String(formData.get("status") ?? "active"),
      notes:
        String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", leaderId)
    .eq("campaign_id", campaignId);

  if (error) {
    console.error("Erro ao atualizar liderança:", error);

    return {
      error: "Não foi possível salvar as alterações.",
    };
  }

  await supabase.from("leader_activities").insert({
    campaign_id: campaignId,
    leader_id: leaderId,
    activity_type: "updated",
    title: "Cadastro atualizado",
    description: "As informações da liderança foram atualizadas.",
    created_by: user.id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/liderancas");
  revalidatePath(`/dashboard/liderancas/${leaderId}`);

  return {
    success: "Alterações salvas com sucesso.",
  };
}

export async function addLeaderActivity(
  leaderId: string,
  _previousState: LeaderDetailState,
  formData: FormData
): Promise<LeaderDetailState> {
  const { supabase, user, campaignId } = await getCurrentCampaign();

  if (!user || !campaignId) {
    return {
      error: "Não foi possível identificar sua campanha.",
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(
    formData.get("description") ?? ""
  ).trim();
  const activityType = String(
    formData.get("activity_type") ?? "note"
  );

  if (!title) {
    return {
      error: "Informe o título da atividade.",
    };
  }

  const { error } = await supabase
    .from("leader_activities")
    .insert({
      campaign_id: campaignId,
      leader_id: leaderId,
      activity_type: activityType,
      title,
      description: description || null,
      created_by: user.id,
    });

  if (error) {
    console.error("Erro ao registrar atividade:", error);

    return {
      error: "Não foi possível registrar a atividade.",
    };
  }

  revalidatePath(`/dashboard/liderancas/${leaderId}`);

  return {
    success: "Atividade registrada com sucesso.",
  };
}

export async function linkSupporter(
  leaderId: string,
  _previousState: LeaderDetailState,
  formData: FormData
): Promise<LeaderDetailState> {
  const { supabase, user, campaignId } = await getCurrentCampaign();

  if (!user || !campaignId) {
    return {
      error: "Não foi possível identificar sua campanha.",
    };
  }

  const supporterId = String(
    formData.get("supporter_id") ?? ""
  ).trim();

  if (!supporterId) {
    return {
      error: "Selecione um apoiador.",
    };
  }

  const { data: supporter } = await supabase
    .from("supporters")
    .select("id, full_name, leader_id")
    .eq("id", supporterId)
    .eq("campaign_id", campaignId)
    .eq("is_active", true)
    .maybeSingle();

  if (!supporter) {
    return {
      error: "Apoiador não encontrado.",
    };
  }

  if (supporter.leader_id === leaderId) {
    return {
      error: "Este apoiador já está vinculado à liderança.",
    };
  }

  const { error } = await supabase
    .from("supporters")
    .update({
      leader_id: leaderId,
    })
    .eq("id", supporterId)
    .eq("campaign_id", campaignId);

  if (error) {
    console.error("Erro ao vincular apoiador:", error);

    return {
      error: "Não foi possível vincular o apoiador.",
    };
  }

  await Promise.all([
    supabase.from("leader_activities").insert({
      campaign_id: campaignId,
      leader_id: leaderId,
      activity_type: "supporter_linked",
      title: "Apoiador vinculado",
      description: `${supporter.full_name} foi vinculado à liderança.`,
      created_by: user.id,
    }),

    supabase.from("supporter_activities").insert({
      campaign_id: campaignId,
      supporter_id: supporterId,
      activity_type: "updated",
      title: "Liderança vinculada",
      description: "O apoiador foi vinculado a uma liderança.",
      created_by: user.id,
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/apoiadores");
  revalidatePath(`/dashboard/apoiadores/${supporterId}`);
  revalidatePath("/dashboard/liderancas");
  revalidatePath(`/dashboard/liderancas/${leaderId}`);

  return {
    success: "Apoiador vinculado com sucesso.",
  };
}

export async function unlinkSupporter(
  leaderId: string,
  supporterId: string
) {
  const { supabase, user, campaignId } = await getCurrentCampaign();

  if (!user || !campaignId) {
    return;
  }

  const { data: supporter } = await supabase
    .from("supporters")
    .select("full_name")
    .eq("id", supporterId)
    .eq("campaign_id", campaignId)
    .eq("leader_id", leaderId)
    .maybeSingle();

  if (!supporter) {
    return;
  }

  const { error } = await supabase
    .from("supporters")
    .update({
      leader_id: null,
    })
    .eq("id", supporterId)
    .eq("campaign_id", campaignId)
    .eq("leader_id", leaderId);

  if (error) {
    console.error("Erro ao remover vínculo:", error);
    return;
  }

  await Promise.all([
    supabase.from("leader_activities").insert({
      campaign_id: campaignId,
      leader_id: leaderId,
      activity_type: "supporter_unlinked",
      title: "Apoiador desvinculado",
      description: `${supporter.full_name} foi removido da liderança.`,
      created_by: user.id,
    }),

    supabase.from("supporter_activities").insert({
      campaign_id: campaignId,
      supporter_id: supporterId,
      activity_type: "updated",
      title: "Liderança removida",
      description: "O vínculo com a liderança foi removido.",
      created_by: user.id,
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/apoiadores");
  revalidatePath(`/dashboard/apoiadores/${supporterId}`);
  revalidatePath("/dashboard/liderancas");
  revalidatePath(`/dashboard/liderancas/${leaderId}`);
}