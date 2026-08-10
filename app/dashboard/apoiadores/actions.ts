"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SupporterActionState = {
  success?: string;
  error?: string;
};

const validStatuses = [
  "lead",
  "supporter",
  "volunteer",
  "inactive",
] as const;

const validOrigins = [
  "landing_page",
  "manual",
  "event",
  "referral",
  "social_media",
  "other",
] as const;

export async function createSupporter(
  _previousState: SupporterActionState,
  formData: FormData
): Promise<SupporterActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Sua sessão expirou. Entre novamente.",
    };
  }

  const fullName = String(
    formData.get("full_name") ?? ""
  ).trim();

  const whatsapp = String(
    formData.get("whatsapp") ?? ""
  ).trim();

  const phone = String(
    formData.get("phone") ?? ""
  ).trim();

  const email = String(
    formData.get("email") ?? ""
  ).trim();

  const city = String(
    formData.get("city") ?? ""
  ).trim();

  const neighborhood = String(
    formData.get("neighborhood") ?? ""
  ).trim();

  const profession = String(
    formData.get("profession") ?? ""
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  const status = String(
    formData.get("status") ?? "supporter"
  );

  const origin = String(
    formData.get("origin") ?? "manual"
  );

  const areaId = String(
    formData.get("area_id") ?? ""
  ).trim();

  const teamId = String(
    formData.get("team_id") ?? ""
  ).trim();

  const assignedMemberId = String(
    formData.get("assigned_member_id") ?? ""
  ).trim();

  const nextContactValue = String(
    formData.get("next_contact_at") ?? ""
  ).trim();

  const isLeader =
    formData.get("is_leader") === "on";

  if (!fullName) {
    return {
      error: "Informe o nome completo do apoiador.",
    };
  }

  if (
    !validStatuses.includes(
      status as (typeof validStatuses)[number]
    )
  ) {
    return {
      error: "A situação selecionada é inválida.",
    };
  }

  if (
    !validOrigins.includes(
      origin as (typeof validOrigins)[number]
    )
  ) {
    return {
      error: "A origem selecionada é inválida.",
    };
  }

  let nextContactAt: string | null = null;

  if (nextContactValue) {
    const nextContactDate = new Date(
      nextContactValue
    );

    if (Number.isNaN(nextContactDate.getTime())) {
      return {
        error:
          "A data do próximo contato é inválida.",
      };
    }

    nextContactAt =
      nextContactDate.toISOString();
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("campaign_members")
    .select(`
      id,
      campaign_id
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      error:
        "Não foi possível identificar a campanha.",
    };
  }

  if (areaId) {
    const { data: area } = await supabase
      .from("campaign_areas")
      .select("id")
      .eq("id", areaId)
      .eq(
        "campaign_id",
        membership.campaign_id
      )
      .maybeSingle();

    if (!area) {
      return {
        error:
          "A área selecionada não pertence à campanha.",
      };
    }
  }

  if (teamId) {
    const { data: team } = await supabase
      .from("mobilization_teams")
      .select(`
        id,
        area_id
      `)
      .eq("id", teamId)
      .eq(
        "campaign_id",
        membership.campaign_id
      )
      .maybeSingle();

    if (!team) {
      return {
        error:
          "A equipe selecionada não pertence à campanha.",
      };
    }

    if (
      areaId &&
      team.area_id &&
      team.area_id !== areaId
    ) {
      return {
        error:
          "A equipe selecionada não pertence à área informada.",
      };
    }
  }

  if (assignedMemberId) {
    const { data: assignedMember } =
      await supabase
        .from("campaign_members")
        .select("id")
        .eq("id", assignedMemberId)
        .eq(
          "campaign_id",
          membership.campaign_id
        )
        .eq("is_active", true)
        .maybeSingle();

    if (!assignedMember) {
      return {
        error:
          "O responsável selecionado não pertence à campanha.",
      };
    }
  }

  const { data: supporter, error } =
    await supabase
      .from("supporters")
      .insert({
        campaign_id:
          membership.campaign_id,
        full_name: fullName,
        whatsapp: whatsapp || null,
        phone: phone || null,
        email: email || null,
        city: city || null,
        neighborhood: neighborhood || null,
        profession: profession || null,
        notes: notes || null,
        status,
        origin,
        area_id: areaId || null,
        team_id: teamId || null,
        assigned_member_id:
          assignedMemberId || null,
        is_leader: isLeader,
        next_contact_at: nextContactAt,
        created_by: user.id,
        is_active: true,
      })
      .select("id")
      .single();

  if (error || !supporter) {
    console.error(
      "Erro ao cadastrar apoiador:",
      error
    );

    return {
      error:
        "Não foi possível cadastrar o apoiador.",
    };
  }

  const activityDescriptions: string[] = [
    "Cadastro realizado pelo painel da campanha.",
  ];

  if (areaId) {
    activityDescriptions.push(
      "Vinculado a uma área de mobilização."
    );
  }

  if (teamId) {
    activityDescriptions.push(
      "Vinculado a uma equipe de mobilização."
    );
  }

  if (assignedMemberId) {
    activityDescriptions.push(
      "Responsável pelo acompanhamento definido."
    );
  }

  if (isLeader) {
    activityDescriptions.push(
      "Identificado como liderança."
    );
  }

  const { error: activityError } =
    await supabase
      .from("supporter_activities")
      .insert({
        campaign_id:
          membership.campaign_id,
        supporter_id: supporter.id,
        activity_type: "created",
        title: "Apoiador cadastrado",
        description:
          activityDescriptions.join(" "),
        created_by: user.id,
      });

  if (activityError) {
    console.error(
      "Erro ao registrar atividade:",
      activityError
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/apoiadores");
  revalidatePath("/dashboard/mobilizacao");

  return {
    success:
      "Apoiador cadastrado com sucesso.",
  };
}