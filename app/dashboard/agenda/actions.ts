"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AgendaActionState = {
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

function getTextValue(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

export async function createCampaignEvent(
  _previousState: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const { supabase, user, campaignId } =
    await getCurrentCampaign();

  if (!user || !campaignId) {
    return {
      error: "Não foi possível identificar sua campanha.",
    };
  }

  const title = getTextValue(formData, "title");
  const description = getTextValue(formData, "description");
  const eventType = getTextValue(formData, "event_type");
  const status = getTextValue(formData, "status");

  const startDate = getTextValue(formData, "start_date");
  const startTime = getTextValue(formData, "start_time");

  const endDate = getTextValue(formData, "end_date");
  const endTime = getTextValue(formData, "end_time");

  if (!title) {
    return {
      error: "Informe o título do compromisso.",
    };
  }

  if (!startDate || !startTime) {
    return {
      error: "Informe a data e o horário de início.",
    };
  }

  const startAt = new Date(`${startDate}T${startTime}:00`);

  if (Number.isNaN(startAt.getTime())) {
    return {
      error: "A data de início informada é inválida.",
    };
  }

  let endAt: Date | null = null;

  if (endDate && endTime) {
    endAt = new Date(`${endDate}T${endTime}:00`);

    if (Number.isNaN(endAt.getTime())) {
      return {
        error: "A data de término informada é inválida.",
      };
    }

    if (endAt.getTime() < startAt.getTime()) {
      return {
        error:
          "O término não pode acontecer antes do início do compromisso.",
      };
    }
  }

  const estimatedAudienceValue = Number(
    formData.get("estimated_audience") ?? 0
  );

  const estimatedAudience = Number.isNaN(
    estimatedAudienceValue
  )
    ? 0
    : Math.max(0, estimatedAudienceValue);

  const leaderId = getTextValue(formData, "leader_id");

  const { error } = await supabase
    .from("campaign_events")
    .insert({
      campaign_id: campaignId,
      title,
      description: description || null,
      event_type: eventType || "meeting",
      status: status || "scheduled",
      start_at: startAt.toISOString(),
      end_at: endAt?.toISOString() ?? null,
      city: getTextValue(formData, "city") || null,
      neighborhood:
        getTextValue(formData, "neighborhood") || null,
      address: getTextValue(formData, "address") || null,
      location_name:
        getTextValue(formData, "location_name") || null,
      estimated_audience: estimatedAudience,
      leader_id: leaderId || null,
      notes: getTextValue(formData, "notes") || null,
      responsible_user_id: user.id,
      created_by: user.id,
    });

  if (error) {
    console.error("Erro ao criar compromisso:", error);

    return {
      error: "Não foi possível cadastrar o compromisso.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");

  await revalidatePublicLanding(campaignId, supabase);

  return {
    success: "Compromisso cadastrado com sucesso.",
  };
}

async function revalidatePublicLanding(
  campaignId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data: landingPage } = await supabase
    .from("campaign_landing_pages")
    .select("slug")
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (landingPage?.slug) {
    revalidatePath(`/c/${landingPage.slug}`);
  }
}

export async function updateEventStatus(
  eventId: string,
  formData: FormData
) {
  const { supabase, campaignId } =
    await getCurrentCampaign();

  if (!campaignId) {
    return;
  }

  const status = getTextValue(formData, "status");

  const allowedStatuses = [
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return;
  }

  const { error } = await supabase
    .from("campaign_events")
    .update({
      status,
    })
    .eq("id", eventId)
    .eq("campaign_id", campaignId);

  if (error) {
    console.error(
      "Erro ao atualizar status do compromisso:",
      error
    );

    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  await revalidatePublicLanding(campaignId, supabase);
}

export async function deleteCampaignEvent(eventId: string) {
  const { supabase, campaignId } =
    await getCurrentCampaign();

  if (!campaignId) {
    return;
  }

  const { error } = await supabase
    .from("campaign_events")
    .delete()
    .eq("id", eventId)
    .eq("campaign_id", campaignId);

  if (error) {
    console.error("Erro ao excluir compromisso:", error);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");

  await revalidatePublicLanding(campaignId, supabase);
}

export async function updateCampaignEvent(
  eventId: string,
  _previousState: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const { supabase, user, campaignId } =
    await getCurrentCampaign();

  if (!user || !campaignId) {
    return {
      error: "Não foi possível identificar sua campanha.",
    };
  }

  const title = getTextValue(formData, "title");
  const description = getTextValue(formData, "description");
  const eventType = getTextValue(formData, "event_type");
  const status = getTextValue(formData, "status");

  const startDate = getTextValue(formData, "start_date");
  const startTime = getTextValue(formData, "start_time");

  const endDate = getTextValue(formData, "end_date");
  const endTime = getTextValue(formData, "end_time");

  if (!title) {
    return {
      error: "Informe o título do compromisso.",
    };
  }

  if (!startDate || !startTime) {
    return {
      error: "Informe a data e o horário de início.",
    };
  }

  const startAt = new Date(`${startDate}T${startTime}:00`);

  if (Number.isNaN(startAt.getTime())) {
    return {
      error: "A data de início informada é inválida.",
    };
  }

  let endAt: Date | null = null;

  if (endDate && endTime) {
    endAt = new Date(`${endDate}T${endTime}:00`);

    if (Number.isNaN(endAt.getTime())) {
      return {
        error: "A data de término informada é inválida.",
      };
    }

    if (endAt.getTime() < startAt.getTime()) {
      return {
        error: "O término não pode acontecer antes do início.",
      };
    }
  }

  const estimatedAudienceValue = Number(
    formData.get("estimated_audience") ?? 0
  );

  const estimatedAudience = Number.isNaN(
    estimatedAudienceValue
  )
    ? 0
    : Math.max(0, estimatedAudienceValue);

  const leaderId = getTextValue(formData, "leader_id");

  const allowedStatuses = [
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
  ];

  const allowedEventTypes = [
    "meeting",
    "visit",
    "event",
    "interview",
    "mobilization",
    "internal",
    "other",
  ];

  const { error } = await supabase
    .from("campaign_events")
    .update({
      title,
      description: description || null,
      event_type: allowedEventTypes.includes(eventType)
        ? eventType
        : "meeting",
      status: allowedStatuses.includes(status)
        ? status
        : "scheduled",
      start_at: startAt.toISOString(),
      end_at: endAt?.toISOString() ?? null,
      city: getTextValue(formData, "city") || null,
      neighborhood:
        getTextValue(formData, "neighborhood") || null,
      address: getTextValue(formData, "address") || null,
      location_name:
        getTextValue(formData, "location_name") || null,
      estimated_audience: estimatedAudience,
      leader_id: leaderId || null,
      notes: getTextValue(formData, "notes") || null,
    })
    .eq("id", eventId)
    .eq("campaign_id", campaignId);

  if (error) {
    console.error("Erro ao atualizar compromisso:", error);

    return {
      error: "Não foi possível atualizar o compromisso.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  revalidatePath(`/dashboard/agenda/${eventId}`);

  await revalidatePublicLanding(campaignId, supabase);

  return {
    success: "Compromisso atualizado com sucesso.",
  };
}

export async function addEventMember(
  eventId: string,
  formData: FormData
) {
  const { supabase, campaignId } =
    await getCurrentCampaign();

  if (!campaignId) {
    return;
  }

  const userId = getTextValue(formData, "user_id");

  if (!userId) {
    return;
  }

  const { data: event } = await supabase
    .from("campaign_events")
    .select("id")
    .eq("id", eventId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (!event) {
    return;
  }

  const { data: membership } = await supabase
    .from("campaign_members")
    .select("user_id")
    .eq("campaign_id", campaignId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    return;
  }

  const { error } = await supabase
    .from("campaign_event_members")
    .upsert(
      {
        event_id: eventId,
        user_id: userId,
      },
      {
        onConflict: "event_id,user_id",
        ignoreDuplicates: true,
      }
    );

  if (error) {
    console.error(
      "Erro ao adicionar participante:",
      error
    );

    return;
  }

  revalidatePath("/dashboard/agenda");
  revalidatePath(`/dashboard/agenda/${eventId}`);
  await revalidatePublicLanding(campaignId, supabase);
}

export async function removeEventMember(
  eventId: string,
  userId: string
) {
  const { supabase, campaignId } =
    await getCurrentCampaign();

  if (!campaignId) {
    return;
  }

  const { data: event } = await supabase
    .from("campaign_events")
    .select("id")
    .eq("id", eventId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (!event) {
    return;
  }

  const { error } = await supabase
    .from("campaign_event_members")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    console.error(
      "Erro ao remover participante:",
      error
    );

    return;
  }

  revalidatePath("/dashboard/agenda");
  revalidatePath(`/dashboard/agenda/${eventId}`);
  await revalidatePublicLanding(campaignId, supabase);
}

export async function completeCampaignEvent(
  eventId: string,
  _previousState: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const { supabase, user, campaignId } =
    await getCurrentCampaign();

  if (!user || !campaignId) {
    return {
      error: "Não foi possível identificar sua campanha.",
    };
  }

  const actualAudienceValue = Number(
    formData.get("actual_audience") ?? 0
  );

  const actualAudience = Number.isNaN(
    actualAudienceValue
  )
    ? 0
    : Math.max(0, actualAudienceValue);

  const outcome = getTextValue(formData, "outcome");

  const followUpRequired =
    formData.get("follow_up_required") === "on";

  const followUpNotes = getTextValue(
    formData,
    "follow_up_notes"
  );

  const followUpDueDate = getTextValue(
  formData,
  "follow_up_due_date"
);

  if (!outcome) {
    return {
      error: "Informe o resultado do compromisso.",
    };
  }

  if (followUpRequired && !followUpNotes) {
    return {
      error:
        "Informe qual acompanhamento deverá ser realizado.",
    };
  }

  const { data: event } = await supabase
    .from("campaign_events")
    .select("id")
    .eq("id", eventId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (!event) {
    return {
      error: "Compromisso não encontrado.",
    };
  }

  const { error } = await supabase
  .from("campaign_events")
  .update({
    status: "completed",
    actual_audience: actualAudience,
    outcome,
    follow_up_required: followUpRequired,
    follow_up_notes: followUpNotes || null,
    follow_up_due_date:
      followUpRequired && followUpDueDate
        ? followUpDueDate
        : null,
    follow_up_completed_at: followUpRequired
      ? null
      : new Date().toISOString(),
    completed_at: new Date().toISOString(),
  })
  .eq("id", eventId)
  .eq("campaign_id", campaignId);

  if (error) {
    console.error(
      "Erro ao concluir compromisso:",
      error
    );

    return {
      error: "Não foi possível concluir o compromisso.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  revalidatePath(`/dashboard/agenda/${eventId}`);
  await revalidatePublicLanding(campaignId, supabase);

  return {
    success: "Compromisso concluído com sucesso.",
  };
}

export async function completeEventFollowUp(
  eventId: string
) {
  const { supabase, campaignId } =
    await getCurrentCampaign();

  if (!campaignId) {
    return;
  }

  const { error } = await supabase
    .from("campaign_events")
    .update({
      follow_up_completed_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("campaign_id", campaignId)
    .eq("follow_up_required", true);

  if (error) {
    console.error(
      "Erro ao concluir acompanhamento:",
      error
    );

    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/agenda/acompanhamentos");
  revalidatePath(`/dashboard/agenda/${eventId}`);
  await revalidatePublicLanding(campaignId, supabase);
}

export async function reopenEventFollowUp(
  eventId: string
) {
  const { supabase, campaignId } =
    await getCurrentCampaign();

  if (!campaignId) {
    return;
  }

  const { error } = await supabase
    .from("campaign_events")
    .update({
      follow_up_completed_at: null,
    })
    .eq("id", eventId)
    .eq("campaign_id", campaignId)
    .eq("follow_up_required", true);

  if (error) {
    console.error(
      "Erro ao reabrir acompanhamento:",
      error
    );

    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/agenda/acompanhamentos");
  revalidatePath(`/dashboard/agenda/${eventId}`);
  await revalidatePublicLanding(campaignId, supabase);
}