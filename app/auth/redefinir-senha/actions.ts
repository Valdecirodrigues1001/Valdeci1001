"use server";

import { createClient } from "@/lib/supabase/server";

export type ResetPasswordState = {
  success: boolean;
  message: string;
};

export async function resetPassword(
  _previousState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
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
      message:
        "As senhas não coincidem.",
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
        "O link de recuperação expirou ou não é mais válido. Solicite um novo link.",
    };
  }

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    console.error(
      "Erro ao redefinir senha:",
      {
        message: error.message,
        status: error.status,
        code: error.code,
      }
    );

    return {
      success: false,
      message:
        "Não foi possível redefinir sua senha.",
    };
  }

  return {
    success: true,
    message:
      "Senha redefinida com sucesso.",
  };
}