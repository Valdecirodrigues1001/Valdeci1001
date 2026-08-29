"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
};

export async function login(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!email || !password) {
    return {
      error: "Informe o e-mail e a senha.",
    };
  }

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    console.error("Erro no login:", {
      message: error.message,
      status: error.status,
      code: error.code,
      name: error.name,
    });

    if (error.code === "email_not_confirmed") {
      return {
        error:
          "Confirme seu e-mail antes de acessar o painel.",
      };
    }

    if (
      error.code === "over_request_rate_limit" ||
      error.status === 429
    ) {
      return {
        error:
          "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      };
    }

    return {
      error: "E-mail ou senha inválidos.",
    };
  }

  if (!data.user) {
    return {
      error:
        "Não foi possível identificar o usuário.",
    };
  }

  redirect("/dashboard");
}