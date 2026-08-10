"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DefinePasswordState = {
  success: boolean;
  message: string;
};

export async function definePassword(
  previousState: DefinePasswordState,
  formData: FormData
): Promise<DefinePasswordState> {
  const password = String(
    formData.get("password") ?? ""
  );

  const confirmation = String(
    formData.get("confirmation") ?? ""
  );

  if (password.length < 8) {
    return {
      success: false,
      message:
        "A senha deve possuir pelo menos 8 caracteres.",
    };
  }

  if (password !== confirmation) {
    return {
      success: false,
      message: "As senhas não coincidem.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message:
        "O convite expirou ou não é mais válido. Solicite um novo convite.",
    };
  }

  /*
   * Verifica se o convite realmente vinculou
   * o usuário a uma campanha.
   */
  const { data: membership, error: membershipError } =
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
      .limit(1)
      .maybeSingle();

  if (membershipError) {
    console.error(
      "Erro ao verificar vínculo da campanha:",
      membershipError
    );

    return {
      success: false,
      message:
        "Não foi possível verificar seu vínculo com a campanha.",
    };
  }

  if (!membership) {
    return {
      success: false,
      message:
        "Seu usuário não está vinculado a nenhuma campanha. Solicite um novo convite ao administrador.",
    };
  }

  const { error: passwordError } =
    await supabase.auth.updateUser({
      password,
    });

  if (passwordError) {
    console.error(
      "Erro ao definir senha:",
      passwordError
    );

    return {
      success: false,
      message:
        "Não foi possível definir sua senha. Solicite um novo convite.",
    };
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  const adminSupabase = createAdminClient();

  /*
   * Garante que o perfil do usuário exista.
   */
  const { error: profileError } =
    await adminSupabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name:
            fullName || user.email || "Integrante",
        },
        {
          onConflict: "id",
        }
      );

  if (profileError) {
    console.error(
      "Erro ao atualizar perfil:",
      profileError
    );
  }

  /*
   * Mantém somente os metadados permanentes.
   * Os dados temporários do convite são limpos.
   */
  const { error: metadataError } =
    await adminSupabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          full_name:
            fullName || user.email || "Integrante",
          campaign_id: null,
          campaign_role: null,
          invitation_pending: false,
        },
      }
    );

  if (metadataError) {
    console.error(
      "Erro ao limpar metadados do convite:",
      metadataError
    );
  }

  return {
    success: true,
    message: "Senha definida com sucesso.",
  };
}