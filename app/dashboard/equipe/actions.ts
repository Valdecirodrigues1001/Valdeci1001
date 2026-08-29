"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedRoles = [
  "campaign_admin",
  "manager",
  "editor",
  "viewer",
] as const;

type TeamRole =
  (typeof allowedRoles)[number];

async function getCurrentCampaign() {
  const supabase =
    await createClient();

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

  const { data: membership } =
    await supabase
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

function canManageTeam(
  role: string | null | undefined
) {
  return (
    role === "super_admin" ||
    role === "campaign_admin"
  );
}

export async function updateTeamMember(
  formData: FormData
) {
  const memberId = String(
    formData.get("member_id") ?? ""
  ).trim();

  const role = String(
    formData.get("role") ?? ""
  ).trim() as TeamRole;

  const jobTitle = String(
    formData.get("job_title") ?? ""
  ).trim();

  const phone = String(
    formData.get("phone") ?? ""
  ).trim();

  if (
    !memberId ||
    !allowedRoles.includes(role)
  ) {
    return;
  }

  const {
    supabase,
    membership: currentMembership,
  } = await getCurrentCampaign();

  if (
    !currentMembership ||
    !canManageTeam(
      currentMembership.role
    )
  ) {
    return;
  }

  const { data: targetMember } =
    await supabase
      .from("campaign_members")
      .select(`
        id,
        user_id,
        role
      `)
      .eq("id", memberId)
      .eq(
        "campaign_id",
        currentMembership.campaign_id
      )
      .maybeSingle();

  if (!targetMember) {
    return;
  }

  /*
   * Impede que um administrador
   * altere o nível de um
   * superadministrador.
   */
  if (
    targetMember.role ===
    "super_admin"
  ) {
    return;
  }

  const { error } =
    await supabase
      .from("campaign_members")
      .update({
        role,
        job_title:
          jobTitle || null,
        phone:
          phone || null,
      })
      .eq("id", memberId)
      .eq(
        "campaign_id",
        currentMembership.campaign_id
      );

  if (error) {
    console.error(
      "Erro ao atualizar integrante:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    return;
  }

  revalidatePath("/dashboard");
  revalidatePath(
    "/dashboard/equipe"
  );
}

export async function toggleTeamMemberStatus(
  formData: FormData
) {
  const memberId = String(
    formData.get("member_id") ?? ""
  ).trim();

  const nextStatus =
    String(
      formData.get("next_status")
    ) === "true";

  if (!memberId) {
    return;
  }

  const {
    supabase,
    user,
    membership: currentMembership,
  } = await getCurrentCampaign();

  if (
    !user ||
    !currentMembership ||
    !canManageTeam(
      currentMembership.role
    )
  ) {
    return;
  }

  const { data: targetMember } =
    await supabase
      .from("campaign_members")
      .select(`
        id,
        user_id,
        role
      `)
      .eq("id", memberId)
      .eq(
        "campaign_id",
        currentMembership.campaign_id
      )
      .maybeSingle();

  if (!targetMember) {
    return;
  }

  /*
   * O usuário não pode
   * desativar o próprio acesso.
   */
  if (
    targetMember.user_id ===
      user.id &&
    nextStatus === false
  ) {
    return;
  }

  /*
   * Um administrador de campanha
   * não pode desativar um
   * superadministrador.
   */
  if (
    targetMember.role ===
    "super_admin"
  ) {
    return;
  }

  const { error } =
    await supabase
      .from("campaign_members")
      .update({
        is_active:
          nextStatus,
      })
      .eq("id", memberId)
      .eq(
        "campaign_id",
        currentMembership.campaign_id
      );

  if (error) {
    console.error(
      "Erro ao alterar acesso do integrante:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    return;
  }

  revalidatePath("/dashboard");
  revalidatePath(
    "/dashboard/equipe"
  );
}

export type InviteTeamMemberState = {
  success: boolean;
  message: string;
};

const invitationRoles = [
  "campaign_admin",
  "manager",
  "editor",
  "viewer",
] as const;

export async function inviteTeamMember(
  _previousState: InviteTeamMemberState,
  formData: FormData
): Promise<InviteTeamMemberState> {
  const fullName = String(
    formData.get("full_name") ?? ""
  ).trim();

  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const role = String(
    formData.get("role") ?? ""
  ).trim();

  const jobTitle = String(
    formData.get("job_title") ?? ""
  ).trim();

  const phone = String(
    formData.get("phone") ?? ""
  ).trim();

  if (!fullName) {
    return {
      success: false,
      message:
        "Informe o nome do integrante.",
    };
  }

  if (
    !email ||
    !email.includes("@")
  ) {
    return {
      success: false,
      message:
        "Informe um e-mail válido.",
    };
  }

  if (
    !invitationRoles.includes(
      role as
        (typeof invitationRoles)[number]
    )
  ) {
    return {
      success: false,
      message:
        "Selecione um nível de acesso válido.",
    };
  }

  const {
    membership: currentMembership,
  } = await getCurrentCampaign();

  if (
    !currentMembership ||
    !canManageTeam(
      currentMembership.role
    )
  ) {
    return {
      success: false,
      message:
        "Você não possui permissão para convidar integrantes.",
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.error(
      "NEXT_PUBLIC_SITE_URL não configurada."
    );

    return {
      success: false,
      message:
        "A URL pública do sistema não está configurada.",
    };
  }

  let adminSupabase;

  try {
    adminSupabase =
      createAdminClient();
  } catch (error) {
    console.error(
      "Erro ao criar cliente administrativo:",
      error
    );

    return {
      success: false,
      message:
        "A configuração administrativa do sistema está incompleta.",
    };
  }

  const redirectTo =
    `${siteUrl.replace(/\/$/, "")}/auth/invite-confirm`;

  console.log(
    "Enviando convite:",
    {
      email,
      redirectTo,
      campaignId:
        currentMembership.campaign_id,
      role,
    }
  );

  const {
    data,
    error: invitationError,
  } =
    await adminSupabase
      .auth.admin
      .inviteUserByEmail(
        email,
        {
          redirectTo,

          data: {
            full_name:
              fullName,

            campaign_id:
              currentMembership
                .campaign_id,

            campaign_role:
              role,

            invitation_pending:
              true,
          },
        }
      );

  if (
    invitationError ||
    !data.user
  ) {
    console.error(
      "Erro ao enviar convite:",
      JSON.stringify(
        {
          message:
            invitationError
              ?.message,

          status:
            invitationError
              ?.status,

          code:
            invitationError
              ?.code,

          name:
            invitationError
              ?.name,
        },
        null,
        2
      )
    );

    const errorMessage =
      invitationError
        ?.message
        ?.toLowerCase() ?? "";

    if (
      errorMessage.includes(
        "already"
      ) ||
      errorMessage.includes(
        "registered"
      ) ||
      errorMessage.includes(
        "already been registered"
      )
    ) {
      return {
        success: false,
        message:
          "Este e-mail já possui uma conta cadastrada.",
      };
    }

    if (
      errorMessage.includes(
        "rate limit"
      ) ||
      errorMessage.includes(
        "rate_limit"
      )
    ) {
      return {
        success: false,
        message:
          "O limite temporário de envio de e-mails foi atingido. Aguarde alguns minutos e tente novamente.",
      };
    }

    if (
      errorMessage.includes(
        "smtp"
      ) ||
      errorMessage.includes(
        "email"
      )
    ) {
      return {
        success: false,
        message:
          "Não foi possível enviar o e-mail de convite. Verifique o endereço e tente novamente.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível enviar o convite. Tente novamente em instantes.",
    };
  }

  const invitedUserId =
    data.user.id;

  const {
    error: profileError,
  } = await adminSupabase
    .from("profiles")
    .upsert(
      {
        id:
          invitedUserId,

        full_name:
          fullName,
      },
      {
        onConflict: "id",
      }
    );

  if (profileError) {
    console.error(
      "Erro ao criar perfil do integrante:",
      {
        message:
          profileError.message,
        code:
          profileError.code,
        details:
          profileError.details,
        hint:
          profileError.hint,
      }
    );
  }

  const {
    error: memberError,
  } = await adminSupabase
    .from("campaign_members")
    .upsert(
      {
        campaign_id:
          currentMembership
            .campaign_id,

        user_id:
          invitedUserId,

        role,

        job_title:
          jobTitle || null,

        phone:
          phone || null,

        is_active:
          true,

        joined_at:
          new Date()
            .toISOString(),
      },
      {
        onConflict:
          "campaign_id,user_id",
      }
    );

  if (memberError) {
    console.error(
      "Erro ao vincular integrante:",
      {
        message:
          memberError.message,
        code:
          memberError.code,
        details:
          memberError.details,
        hint:
          memberError.hint,
      }
    );

    return {
      success: false,
      message:
        "O convite foi enviado, mas o integrante não pôde ser vinculado à campanha.",
    };
  }

  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/dashboard/equipe"
  );

  return {
    success: true,
    message:
      `Convite enviado para ${email}.`,
  };
}