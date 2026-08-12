"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { checkPermission } from "@/lib/auth/campaign-access";
import { createClient } from "@/lib/supabase/server";

export type SupporterDetailState = {
  success?: string;
  error?: string;
};

export async function updateSupporter(
  supporterId: string,
  _previousState: SupporterDetailState,
  formData: FormData
): Promise<SupporterDetailState> {
  const { allowed, access } =
    await checkPermission(
      "supporters.manage"
    );

  if (!allowed || !access) {
    return {
      error:
        "Você não possui permissão para editar apoiadores.",
    };
  }

  const supabase = await createClient();

  if (!supporterId) {
    return {
      error: "Apoiador inválido.",
    };
  }

  const fullName = String(
    formData.get("full_name") ?? ""
  ).trim();

  if (!fullName) {
    return {
      error: "Informe o nome completo.",
    };
  }

  const birthDate = String(
    formData.get("birth_date") ?? ""
  ).trim();

  const payload = {
    full_name: fullName,

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

    birth_date:
      birthDate || null,

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

    street:
      String(
        formData.get("street") ?? ""
      ).trim() || null,

    street_number:
      String(
        formData.get("street_number") ?? ""
      ).trim() || null,

    complement:
      String(
        formData.get("complement") ?? ""
      ).trim() || null,

    postal_code:
      String(
        formData.get("postal_code") ?? ""
      ).trim() || null,

    electoral_zone:
      String(
        formData.get("electoral_zone") ?? ""
      ).trim() || null,

    electoral_section:
      String(
        formData.get(
          "electoral_section"
        ) ?? ""
      ).trim() || null,

    polling_place:
      String(
        formData.get("polling_place") ?? ""
      ).trim() || null,

    instagram:
      String(
        formData.get("instagram") ?? ""
      ).trim() || null,

    facebook:
      String(
        formData.get("facebook") ?? ""
      ).trim() || null,

    status: String(
      formData.get("status") ??
        "supporter"
    ),

    origin: String(
      formData.get("origin") ??
        "manual"
    ),

    notes:
      String(
        formData.get("notes") ?? ""
      ).trim() || null,
  };

  const {
    data: updatedSupporter,
    error,
  } = await supabase
    .from("supporters")
    .update(payload)
    .eq("id", supporterId)
    .eq(
      "campaign_id",
      access.campaignId
    )
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao atualizar apoiador:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    return {
      error:
        "Não foi possível salvar as alterações.",
    };
  }

  if (!updatedSupporter) {
    return {
      error:
        "O apoiador não foi encontrado ou já foi excluído.",
    };
  }

  const { error: activityError } =
    await supabase
      .from("supporter_activities")
      .insert({
        campaign_id:
          access.campaignId,

        supporter_id:
          supporterId,

        activity_type:
          "updated",

        title:
          "Cadastro atualizado",

        description:
          "As informações do apoiador foram atualizadas.",

        created_by:
          access.userId,
      });

  if (activityError) {
    console.error(
      "Erro ao registrar atualização no histórico:",
      activityError
    );
  }

  revalidatePath("/dashboard");

  revalidatePath(
    "/dashboard/apoiadores"
  );

  revalidatePath(
    `/dashboard/apoiadores/${supporterId}`
  );

  revalidatePath(
    "/dashboard/crm"
  );

  revalidatePath(
    "/dashboard/mobilizacao"
  );

  return {
    success:
      "Alterações salvas com sucesso.",
  };
}

export async function addSupporterActivity(
  supporterId: string,
  _previousState: SupporterDetailState,
  formData: FormData
): Promise<SupporterDetailState> {
  const { allowed, access } =
    await checkPermission(
      "supporters.manage"
    );

  if (!allowed || !access) {
    return {
      error:
        "Você não possui permissão para registrar atividades.",
    };
  }

  const supabase = await createClient();

  if (!supporterId) {
    return {
      error: "Apoiador inválido.",
    };
  }

  const { data: supporter } =
    await supabase
      .from("supporters")
      .select("id")
      .eq("id", supporterId)
      .eq(
        "campaign_id",
        access.campaignId
      )
      .is("deleted_at", null)
      .maybeSingle();

  if (!supporter) {
    return {
      error:
        "O apoiador não foi encontrado ou já foi excluído.",
    };
  }

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const activityType = String(
    formData.get("activity_type") ??
      "note"
  );

  if (!title) {
    return {
      error:
        "Informe o título da atividade.",
    };
  }

  const { error } = await supabase
    .from("supporter_activities")
    .insert({
      campaign_id:
        access.campaignId,

      supporter_id:
        supporterId,

      activity_type:
        activityType,

      title,

      description:
        description || null,

      created_by:
        access.userId,
    });

  if (error) {
    console.error(
      "Erro ao registrar atividade:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    return {
      error:
        "Não foi possível registrar a atividade.",
    };
  }

  revalidatePath(
    `/dashboard/apoiadores/${supporterId}`
  );

  revalidatePath(
    "/dashboard/crm"
  );

  return {
    success:
      "Atividade registrada com sucesso.",
  };
}

export async function deleteSupporter(
  supporterId: string
): Promise<SupporterDetailState> {
  const { allowed, access } =
    await checkPermission(
      "supporters.manage"
    );

  if (!allowed || !access) {
    return {
      error:
        "Você não possui permissão para excluir apoiadores.",
    };
  }

  const supabase = await createClient();

  if (!supporterId) {
    return {
      error: "Apoiador inválido.",
    };
  }

  const {
    data: supporter,
    error: supporterError,
  } = await supabase
    .from("supporters")
    .select(`
      id,
      full_name
    `)
    .eq("id", supporterId)
    .eq(
      "campaign_id",
      access.campaignId
    )
    .is("deleted_at", null)
    .maybeSingle();

  if (supporterError) {
    console.error(
      "Erro ao localizar apoiador:",
      supporterError
    );

    return {
      error:
        "Não foi possível localizar o apoiador.",
    };
  }

  if (!supporter) {
    return {
      error:
        "O apoiador não foi encontrado ou já foi excluído.",
    };
  }

  const deletedAt =
    new Date().toISOString();

  const {
    data: deletedSupporter,
    error: deleteError,
  } = await supabase
    .from("supporters")
    .update({
      deleted_at: deletedAt,
      status: "inactive",
      is_active: false,
    })
    .eq("id", supporterId)
    .eq(
      "campaign_id",
      access.campaignId
    )
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error(
      "Erro ao excluir apoiador:",
      {
        message:
          deleteError.message,
        details:
          deleteError.details,
        hint:
          deleteError.hint,
        code:
          deleteError.code,
      }
    );

    return {
      error:
        "Não foi possível excluir o apoiador.",
    };
  }

  if (!deletedSupporter) {
    return {
      error:
        "O apoiador não foi encontrado ou já foi excluído.",
    };
  }

  const { error: activityError } =
    await supabase
      .from("supporter_activities")
      .insert({
        campaign_id:
          access.campaignId,

        supporter_id:
          supporterId,

        activity_type:
          "updated",

        title:
          "Apoiador removido",

        description:
          `${supporter.full_name} foi removido do CRM.`,

        created_by:
          access.userId,
      });

  if (activityError) {
    console.error(
      "Erro ao registrar exclusão no histórico:",
      activityError
    );
  }

  revalidatePath("/dashboard");

  revalidatePath(
    "/dashboard/apoiadores"
  );

  revalidatePath(
    `/dashboard/apoiadores/${supporterId}`
  );

  revalidatePath(
    "/dashboard/crm"
  );

  revalidatePath(
    "/dashboard/mobilizacao"
  );

  redirect(
    "/dashboard/apoiadores"
  );
}