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

    return {
      error: `Erro no login: ${error.message}`,
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