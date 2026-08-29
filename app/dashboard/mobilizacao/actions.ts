"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const allowedAreaTypes = [
  "city",
  "neighborhood",
  "region",
  "district",
  "other",
] as const;

type AreaType = (typeof allowedAreaTypes)[number];

async function getCurrentCampaign() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      membership: null,
    };
  }

  const { data: membership } = await supabase
    .from("campaign_members")
    .select(`
      id,
      campaign_id,
      role,
      is_active
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    user,
    membership,
  };
}

function canManageMobilization(
  role: string | null | undefined
) {
  return (
    role === "super_admin" ||
    role === "campaign_admin" ||
    role === "manager" ||
    role === "editor"
  );
}

function parseNonNegativeInteger(value: FormDataEntryValue | null) {
  const parsedValue = Number(value ?? 0);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return Math.floor(parsedValue);
}

function optionalUuid(value: FormDataEntryValue | null) {
  const parsedValue = String(value ?? "").trim();

  return parsedValue || null;
}

export type MobilizationActionState = {
  success: boolean;
  message: string;
};

export async function createCampaignArea(
  previousState: MobilizationActionState,
  formData: FormData
): Promise<MobilizationActionState> {
  const name = String(formData.get("name") ?? "").trim();

  const areaType = String(
    formData.get("area_type") ?? ""
  ).trim() as AreaType;

  const city = String(formData.get("city") ?? "").trim();

  const neighborhood = String(
    formData.get("neighborhood") ?? ""
  ).trim();

  const region = String(
    formData.get("region") ?? ""
  ).trim();

  const coordinatorMemberId = optionalUuid(
    formData.get("coordinator_member_id")
  );

  const supportersGoal = parseNonNegativeInteger(
    formData.get("supporters_goal")
  );

  const visitsGoal = parseNonNegativeInteger(
    formData.get("visits_goal")
  );

  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    return {
      success: false,
      message: "Informe o nome da área.",
    };
  }

  if (!allowedAreaTypes.includes(areaType)) {
    return {
      success: false,
      message: "Selecione um tipo de área válido.",
    };
  }

  const { supabase, membership } =
    await getCurrentCampaign();

  if (
    !membership ||
    !canManageMobilization(membership.role)
  ) {
    return {
      success: false,
      message:
        "Você não possui permissão para cadastrar áreas.",
    };
  }

  if (coordinatorMemberId) {
    const { data: coordinator } = await supabase
      .from("campaign_members")
      .select("id")
      .eq("id", coordinatorMemberId)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!coordinator) {
      return {
        success: false,
        message:
          "O coordenador selecionado não pertence à campanha.",
      };
    }
  }

  const { error } = await supabase
    .from("campaign_areas")
    .insert({
      campaign_id: membership.campaign_id,
      name,
      area_type: areaType,
      city: city || null,
      neighborhood: neighborhood || null,
      region: region || null,
      coordinator_member_id: coordinatorMemberId,
      supporters_goal: supportersGoal,
      visits_goal: visitsGoal,
      notes: notes || null,
      is_active: true,
    });

  if (error) {
    console.error("Erro ao cadastrar área:", error);

    if (
      error.code === "23505" ||
      error.message.toLowerCase().includes("duplicate")
    ) {
      return {
        success: false,
        message:
          "Já existe uma área com esse nome nesta campanha.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível cadastrar a área.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mobilizacao");

  return {
    success: true,
    message: "Área cadastrada com sucesso.",
  };
}

export async function createMobilizationTeam(
  previousState: MobilizationActionState,
  formData: FormData
): Promise<MobilizationActionState> {
  const name = String(formData.get("name") ?? "").trim();

  const areaId = optionalUuid(formData.get("area_id"));

  const coordinatorMemberId = optionalUuid(
    formData.get("coordinator_member_id")
  );

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const supportersGoal = parseNonNegativeInteger(
    formData.get("supporters_goal")
  );

  const visitsGoal = parseNonNegativeInteger(
    formData.get("visits_goal")
  );

  const eventsGoal = parseNonNegativeInteger(
    formData.get("events_goal")
  );

  if (!name) {
    return {
      success: false,
      message: "Informe o nome da equipe.",
    };
  }

  const { supabase, membership } =
    await getCurrentCampaign();

  if (
    !membership ||
    !canManageMobilization(membership.role)
  ) {
    return {
      success: false,
      message:
        "Você não possui permissão para cadastrar equipes.",
    };
  }

  if (areaId) {
    const { data: area } = await supabase
      .from("campaign_areas")
      .select("id")
      .eq("id", areaId)
      .eq("campaign_id", membership.campaign_id)
      .maybeSingle();

    if (!area) {
      return {
        success: false,
        message:
          "A área selecionada não pertence à campanha.",
      };
    }
  }

  if (coordinatorMemberId) {
    const { data: coordinator } = await supabase
      .from("campaign_members")
      .select("id")
      .eq("id", coordinatorMemberId)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!coordinator) {
      return {
        success: false,
        message:
          "O coordenador selecionado não pertence à campanha.",
      };
    }
  }

  const { data: createdTeam, error } = await supabase
    .from("mobilization_teams")
    .insert({
      campaign_id: membership.campaign_id,
      area_id: areaId,
      name,
      coordinator_member_id: coordinatorMemberId,
      description: description || null,
      supporters_goal: supportersGoal,
      visits_goal: visitsGoal,
      events_goal: eventsGoal,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !createdTeam) {
    console.error(
      "Erro ao cadastrar equipe de mobilização:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar a equipe.",
    };
  }

  if (coordinatorMemberId) {
    const { error: coordinatorError } = await supabase
      .from("mobilization_team_members")
      .upsert(
        {
          campaign_id: membership.campaign_id,
          team_id: createdTeam.id,
          campaign_member_id: coordinatorMemberId,
          team_role: "coordinator",
          is_active: true,
        },
        {
          onConflict:
            "team_id,campaign_member_id",
        }
      );

    if (coordinatorError) {
      console.error(
        "Erro ao vincular coordenador à equipe:",
        coordinatorError
      );
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mobilizacao");

  return {
    success: true,
    message: "Equipe cadastrada com sucesso.",
  };
}

export async function toggleCampaignAreaStatus(
  formData: FormData
) {
  const areaId = String(
    formData.get("area_id") ?? ""
  ).trim();

  const nextStatus =
    String(formData.get("next_status")) === "true";

  if (!areaId) {
    return;
  }

  const { supabase, membership } =
    await getCurrentCampaign();

  if (
    !membership ||
    !canManageMobilization(membership.role)
  ) {
    return;
  }

  const { error } = await supabase
    .from("campaign_areas")
    .update({
      is_active: nextStatus,
    })
    .eq("id", areaId)
    .eq("campaign_id", membership.campaign_id);

  if (error) {
    console.error(
      "Erro ao alterar status da área:",
      error
    );

    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mobilizacao");
}

export async function toggleMobilizationTeamStatus(
  formData: FormData
) {
  const teamId = String(
    formData.get("team_id") ?? ""
  ).trim();

  const nextStatus =
    String(formData.get("next_status")) === "true";

  if (!teamId) {
    return;
  }

  const { supabase, membership } =
    await getCurrentCampaign();

  if (
    !membership ||
    !canManageMobilization(membership.role)
  ) {
    return;
  }

  const { error } = await supabase
    .from("mobilization_teams")
    .update({
      is_active: nextStatus,
    })
    .eq("id", teamId)
    .eq("campaign_id", membership.campaign_id);

  if (error) {
    console.error(
      "Erro ao alterar status da equipe:",
      error
    );

    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mobilizacao");
}

export async function addMobilizationTeamMember(
  previousState: MobilizationActionState,
  formData: FormData
): Promise<MobilizationActionState> {
  const teamId = String(
    formData.get("team_id") ?? ""
  ).trim();

  const campaignMemberId = String(
    formData.get("campaign_member_id") ?? ""
  ).trim();

  const teamRole = String(
    formData.get("team_role") ?? "member"
  ).trim();

  const allowedRoles = [
    "coordinator",
    "leader",
    "member",
  ];

  if (!teamId || !campaignMemberId) {
    return {
      success: false,
      message: "Selecione um integrante.",
    };
  }

  if (!allowedRoles.includes(teamRole)) {
    return {
      success: false,
      message: "Selecione uma função válida.",
    };
  }

  const { supabase, membership } =
    await getCurrentCampaign();

  if (
    !membership ||
    !canManageMobilization(membership.role)
  ) {
    return {
      success: false,
      message:
        "Você não possui permissão para gerenciar integrantes.",
    };
  }

  const [{ data: team }, { data: campaignMember }] =
    await Promise.all([
      supabase
        .from("mobilization_teams")
        .select("id")
        .eq("id", teamId)
        .eq(
          "campaign_id",
          membership.campaign_id
        )
        .maybeSingle(),

      supabase
        .from("campaign_members")
        .select("id")
        .eq("id", campaignMemberId)
        .eq(
          "campaign_id",
          membership.campaign_id
        )
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  if (!team) {
    return {
      success: false,
      message:
        "A equipe selecionada não pertence à campanha.",
    };
  }

  if (!campaignMember) {
    return {
      success: false,
      message:
        "O integrante selecionado não pertence à campanha.",
    };
  }

  const { error } = await supabase
    .from("mobilization_team_members")
    .upsert(
      {
        campaign_id: membership.campaign_id,
        team_id: teamId,
        campaign_member_id: campaignMemberId,
        team_role: teamRole,
        is_active: true,
      },
      {
        onConflict:
          "team_id,campaign_member_id",
      }
    );

  if (error) {
    console.error(
      "Erro ao adicionar integrante:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível adicionar o integrante.",
    };
  }

  revalidatePath("/dashboard/mobilizacao");

  return {
    success: true,
    message: "Integrante adicionado com sucesso.",
  };
}

export async function removeMobilizationTeamMember(
  formData: FormData
) {
  const teamMemberId = String(
    formData.get("team_member_id") ?? ""
  ).trim();

  if (!teamMemberId) {
    return;
  }

  const { supabase, membership } =
    await getCurrentCampaign();

  if (
    !membership ||
    !canManageMobilization(membership.role)
  ) {
    return;
  }

  const { error } = await supabase
    .from("mobilization_team_members")
    .update({
      is_active: false,
    })
    .eq("id", teamMemberId)
    .eq(
      "campaign_id",
      membership.campaign_id
    );

  if (error) {
    console.error(
      "Erro ao remover integrante:",
      error
    );

    return;
  }

  revalidatePath("/dashboard/mobilizacao");
}

export async function updateCampaignArea(
  previousState: MobilizationActionState,
  formData: FormData
): Promise<MobilizationActionState> {
  const areaId = String(formData.get("area_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const areaType = String(
    formData.get("area_type") ?? ""
  ).trim() as AreaType;

  const city = String(formData.get("city") ?? "").trim();
  const neighborhood = String(
    formData.get("neighborhood") ?? ""
  ).trim();
  const region = String(formData.get("region") ?? "").trim();

  const coordinatorMemberId = optionalUuid(
    formData.get("coordinator_member_id")
  );

  const supportersGoal = parseNonNegativeInteger(
    formData.get("supporters_goal")
  );

  const visitsGoal = parseNonNegativeInteger(
    formData.get("visits_goal")
  );

  const notes = String(formData.get("notes") ?? "").trim();

  if (!areaId || !name) {
    return {
      success: false,
      message: "Preencha os dados obrigatórios da área.",
    };
  }

  if (!allowedAreaTypes.includes(areaType)) {
    return {
      success: false,
      message: "Selecione um tipo de área válido.",
    };
  }

  const { supabase, membership } = await getCurrentCampaign();

  if (
    !membership ||
    !canManageMobilization(membership.role)
  ) {
    return {
      success: false,
      message: "Você não possui permissão para editar áreas.",
    };
  }

  if (coordinatorMemberId) {
    const { data: coordinator } = await supabase
      .from("campaign_members")
      .select("id")
      .eq("id", coordinatorMemberId)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!coordinator) {
      return {
        success: false,
        message: "O coordenador selecionado não pertence à campanha.",
      };
    }
  }

  const { error } = await supabase
    .from("campaign_areas")
    .update({
      name,
      area_type: areaType,
      city: city || null,
      neighborhood: neighborhood || null,
      region: region || null,
      coordinator_member_id: coordinatorMemberId,
      supporters_goal: supportersGoal,
      visits_goal: visitsGoal,
      notes: notes || null,
    })
    .eq("id", areaId)
    .eq("campaign_id", membership.campaign_id);

  if (error) {
    console.error("Erro ao editar área:", error);

    if (error.code === "23505") {
      return {
        success: false,
        message: "Já existe uma área com esse nome.",
      };
    }

    return {
      success: false,
      message: "Não foi possível atualizar a área.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mobilizacao");

  return {
    success: true,
    message: "Área atualizada com sucesso.",
  };
}

export async function updateMobilizationTeam(
  previousState: MobilizationActionState,
  formData: FormData
): Promise<MobilizationActionState> {
  const teamId = String(formData.get("team_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  const areaId = optionalUuid(formData.get("area_id"));

  const coordinatorMemberId = optionalUuid(
    formData.get("coordinator_member_id")
  );

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const supportersGoal = parseNonNegativeInteger(
    formData.get("supporters_goal")
  );

  const visitsGoal = parseNonNegativeInteger(
    formData.get("visits_goal")
  );

  const eventsGoal = parseNonNegativeInteger(
    formData.get("events_goal")
  );

  if (!teamId || !name) {
    return {
      success: false,
      message: "Informe o nome da equipe.",
    };
  }

  const { supabase, membership } = await getCurrentCampaign();

  if (
    !membership ||
    !canManageMobilization(membership.role)
  ) {
    return {
      success: false,
      message: "Você não possui permissão para editar equipes.",
    };
  }

  if (areaId) {
    const { data: area } = await supabase
      .from("campaign_areas")
      .select("id")
      .eq("id", areaId)
      .eq("campaign_id", membership.campaign_id)
      .maybeSingle();

    if (!area) {
      return {
        success: false,
        message: "A área selecionada não pertence à campanha.",
      };
    }
  }

  if (coordinatorMemberId) {
    const { data: coordinator } = await supabase
      .from("campaign_members")
      .select("id")
      .eq("id", coordinatorMemberId)
      .eq("campaign_id", membership.campaign_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!coordinator) {
      return {
        success: false,
        message: "O coordenador selecionado não pertence à campanha.",
      };
    }
  }

  const { data: currentTeam, error: teamError } = await supabase
    .from("mobilization_teams")
    .select("coordinator_member_id")
    .eq("id", teamId)
    .eq("campaign_id", membership.campaign_id)
    .maybeSingle();

  if (teamError || !currentTeam) {
    return {
      success: false,
      message: "Equipe não encontrada.",
    };
  }

  const { error } = await supabase
    .from("mobilization_teams")
    .update({
      name,
      area_id: areaId,
      coordinator_member_id: coordinatorMemberId,
      description: description || null,
      supporters_goal: supportersGoal,
      visits_goal: visitsGoal,
      events_goal: eventsGoal,
    })
    .eq("id", teamId)
    .eq("campaign_id", membership.campaign_id);

  if (error) {
    console.error("Erro ao editar equipe:", error);

    return {
      success: false,
      message: "Não foi possível atualizar a equipe.",
    };
  }

  if (
    currentTeam.coordinator_member_id &&
    currentTeam.coordinator_member_id !== coordinatorMemberId
  ) {
    await supabase
      .from("mobilization_team_members")
      .update({
        is_active: false,
      })
      .eq("team_id", teamId)
      .eq(
        "campaign_member_id",
        currentTeam.coordinator_member_id
      )
      .eq("team_role", "coordinator");
  }

  if (coordinatorMemberId) {
    const { error: coordinatorError } = await supabase
      .from("mobilization_team_members")
      .upsert(
        {
          campaign_id: membership.campaign_id,
          team_id: teamId,
          campaign_member_id: coordinatorMemberId,
          team_role: "coordinator",
          is_active: true,
        },
        {
          onConflict: "team_id,campaign_member_id",
        }
      );

    if (coordinatorError) {
      console.error(
        "Erro ao atualizar coordenador da equipe:",
        coordinatorError
      );
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mobilizacao");

  return {
    success: true,
    message: "Equipe atualizada com sucesso.",
  };
}