"use server";

import { createClient } from "@/lib/supabase/server";

export type ForgotPasswordState = {
  success: boolean;
  message: string;
};

export async function requestPasswordReset(
  _previousState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Informe um e-mail válido.",
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
        "Não foi possível iniciar a recuperação de senha.",
    };
  }

  const supabase = await createClient();

  const redirectTo = new URL(
    "/auth/redefinir-senha",
    siteUrl
  );

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          redirectTo.toString(),
      }
    );

  if (error) {
    console.error(
      "Erro ao solicitar recuperação de senha:",
      {
        message: error.message,
        status: error.status,
        code: error.code,
      }
    );

    return {
      success: false,
      message:
        "Não foi possível enviar o e-mail de recuperação. Tente novamente.",
    };
  }

  /*
   * Não informamos se o e-mail existe ou não.
   * Isso evita expor quais contas estão
   * cadastradas no sistema.
   */
  return {
    success: true,
    message:
      "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
  };
}