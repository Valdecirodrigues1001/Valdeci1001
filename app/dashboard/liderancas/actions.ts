"use server";

import { revalidatePath } from "next/cache";

import { checkPermission } from "@/lib/auth/campaign-access";
import { createClient } from "@/lib/supabase/server";

export type LeaderActionState = {
  success?: string;
  error?: string;
};

const validStatuses = [
  "prospect",
  "active",
  "inactive",
] as const;

export async function createLeader(
  _previousState: LeaderActionState,
  formData: FormData
): Promise<LeaderActionState> {
  const { allowed, access } =
    await checkPermission("leaders.manage");

  if (!allowed || !access) {
    return {
      error:
        "Você não possui permissão para cadastrar lideranças.",
    };
  }

  const supabase = await createClient();

  const fullName = String(
    formData.get("full_name") ?? ""
  ).trim();

  if (!fullName) {
    return {
      error:
        "Informe o nome completo da liderança.",
    };
  }

  const estimatedSupportersValue = Number(
    formData.get("estimated_supporters") ?? 0
  );

  const estimatedSupporters =
    Number.isNaN(estimatedSupportersValue)
      ? 0
      : Math.max(
          0,
          Math.floor(estimatedSupportersValue)
        );

  const parentLeaderId = String(
    formData.get("parent_leader_id") ?? ""
  ).trim();

  const status = String(
    formData.get("status") ?? "active"
  );

  if (
    !validStatuses.includes(
      status as (typeof validStatuses)[number]
    )
  ) {
    return {
      error:
        "O status selecionado é inválido.",
    };
  }

  /*
   * Se houver uma liderança responsável,
   * garantimos que ela pertença à mesma campanha.
   */
  if (parentLeaderId) {
    const { data: parentLeader } =
      await supabase
        .from("leaders")
        .select("id")
        .eq("id", parentLeaderId)
        .eq(
          "campaign_id",
          access.campaignId
        )
        .eq("is_active", true)
        .maybeSingle();

    if (!parentLeader) {
      return {
        error:
          "A liderança responsável selecionada não pertence à campanha.",
      };
    }
  }

  const { data: leader, error } =
    await supabase
      .from("leaders")
      .insert({
        campaign_id:
          access.campaignId,

        parent_leader_id:
          parentLeaderId || null,

        full_name:
          fullName,

        whatsapp:
          String(
            formData.get("whatsapp") ?? ""
          ).trim() || null,

        phone:
          String(
            formData.get("phone") ?? ""
          ).trim() || null,

        email:
          String(
            formData.get("email") ?? ""
          ).trim() || null,

        profession:
          String(
            formData.get("profession") ?? ""
          ).trim() || null,

        city:
          String(
            formData.get("city") ?? ""
          ).trim() || null,

        neighborhood:
          String(
            formData.get("neighborhood") ?? ""
          ).trim() || null,

        area_of_influence:
          String(
            formData.get(
              "area_of_influence"
            ) ?? ""
          ).trim() || null,

        estimated_supporters:
          estimatedSupporters,

        status,

        notes:
          String(
            formData.get("notes") ?? ""
          ).trim() || null,

        created_by:
          access.userId,

        is_active:
          true,
      })
      .select("id")
      .single();

  if (error || !leader) {
    console.error(
      "Erro ao cadastrar liderança:",
      {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      }
    );

    return {
      error:
        "Não foi possível cadastrar a liderança.",
    };
  }

  const { error: activityError } =
    await supabase
      .from("leader_activities")
      .insert({
        campaign_id:
          access.campaignId,

        leader_id:
          leader.id,

        activity_type:
          "created",

        title:
          "Liderança cadastrada",

        description:
          "Cadastro realizado pelo painel da campanha.",

        created_by:
          access.userId,
      });

  if (activityError) {
    console.error(
      "Erro ao registrar atividade da liderança:",
      activityError
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(
    "/dashboard/liderancas"
  );
  revalidatePath(
    "/dashboard/mobilizacao"
  );

  return {
    success:
      "Liderança cadastrada com sucesso.",
  };
}